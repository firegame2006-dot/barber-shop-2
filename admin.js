/* ==========================================================================
   MONARCH — admin panel

   Four sections over the same Supabase project the public site uses. The only
   thing standing between a visitor and this data is row-level security: every
   table here refuses reads and writes unless auth.uid() is in `admins`. The
   page is not a secret and does not need to be — opening it without an
   account shows a login form and nothing else.

   No service_role key. The publishable key below is the same one the public
   page ships; what it may do is decided entirely by the policies.
   ========================================================================== */

(function () {
    "use strict";

    var SUPABASE_URL = "https://mvnmnhtcgbgpbocjafqz.supabase.co";
    var SUPABASE_KEY = "sb_publishable_f8cgj01CBVrdHXrfAPiarA_RZzHC5VD";
    var BUCKET = "media";

    var db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    var $ = function (sel, root) { return (root || document).querySelector(sel); };
    var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

    var STATUS_LABEL = {
        pending: "Awaiting confirmation",
        confirmed: "Confirmed",
        cancelled: "Cancelled"
    };

    /* An order travels further than a booking does. */
    var ORDER_STATUS_LABEL = {
        pending: "Awaiting confirmation",
        confirmed: "Confirmed",
        processing: "Processing",
        shipped: "Shipped",
        completed: "Completed",
        cancelled: "Cancelled"
    };

    var METHOD_LABEL = { pickup: "Pickup", delivery: "Delivery" };
    var PAYMENT_LABEL = { cash: "Cash", card: "Card", online: "Online" };

    /* ---- Rows held in memory ------------------------------------------------
       Every section keeps the rows it last fetched. Two things follow, and
       both were costing a full round trip each:

         · the editor opens from this, so clicking "Edit" is instant
           instead of waiting on a request for a row we already have;
         · a write returns the affected row in the same request, and we patch
           this list with it, rather than re-downloading the whole table.

       null means "never loaded" — switching to a tab fetches once, and after
       that only a real change reloads it. */
    var rows = { appointments: null, orders: null, barbers: null, gallery: null,
                 services: null, products: null };

    /* Put a row in its place, or add it if it is new. */
    function upsertRow(key, row) {
        var list = rows[key] || (rows[key] = []);
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === row.id) { list[i] = row; return; }
        }
        list.push(row);
    }

    function dropRow(key, id) {
        if (rows[key]) rows[key] = rows[key].filter(function (r) { return r.id !== id; });
    }

    function findRow(key, id) {
        return (rows[key] || []).filter(function (r) { return r.id === id; })[0];
    }

    /* sort_order first, id as the tiebreak — the same order the server sends,
       kept locally so a patched list never jumps around. */
    function sortRows(key) {
        if (!rows[key]) return;
        rows[key].sort(function (a, b) {
            return (a.sort_order - b.sort_order) || (a.id - b.id);
        });
    }

    /* ---- Small helpers -------------------------------------------------- */

    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    /* The label to show for a bilingual row.

       Every table stores a _ua and a _en column, and the lists used to render
       the Ukrainian one, so the panel read as Ukrainian however English its
       own chrome was. English comes first now, with Ukrainian as the fallback
       for a row whose English half is still empty -- the same precedence the
       public site applies, so the admin shows what a visitor would see. */
    function label(row, base) {
        if (!row) return "";
        var en = row[base + "_en"];
        if (en && String(en).trim()) return en;
        return row[base + "_ua"] || "";
    }

    var toastTimer = null;
    function toast(msg, isError) {
        var el = $("#admToast");
        el.textContent = msg;
        el.classList.toggle("is-error", !!isError);
        el.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, 3600);
    }

    /* Every write goes through here, so a failure can never pass silently:
       the message from Postgres is what the operator sees. */
    function run(promise, okMsg) {
        return promise.then(function (res) {
            if (res && res.error) throw res.error;
            if (okMsg) toast(okMsg);
            return res ? res.data : null;
        }).catch(function (err) {
            var msg = (err && (err.message || err.error_description)) || "Unknown error";
            toast(msg, true);
            if (window.console) console.error("[admin]", err);
            throw err;
        });
    }

    function fmtDate(iso) {
        if (!iso) return "";
        var p = String(iso).slice(0, 10).split("-");
        return p.length === 3 ? p[2] + "." + p[1] + "." + p[0] : iso;
    }

    function fmtTime(t) { return String(t || "").slice(0, 5); }

    /* A path in the bucket becomes the URL the public site will render. */
    function publicUrl(path) {
        return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }

    /* ---- Auth ----------------------------------------------------------- */

    function showGate(message) {
        $("#admPanel").hidden = true;
        $("#admGate").hidden = false;
        var err = $("#admLoginError");
        err.hidden = !message;
        err.textContent = message || "";
    }

    function showPanel(email) {
        $("#admGate").hidden = true;
        $("#admPanel").hidden = false;
        $("#admEmailLabel").textContent = email || "";
    }

    /* Signing in is not the same as being an administrator. The roster is
       itself behind RLS, so this read succeeds only for a real admin — which
       makes it a truthful check rather than a decorative one. */
    function assertAdmin() {
        return db.from("admins").select("user_id").limit(1).then(function (res) {
            if (res.error) throw res.error;
            return res.data && res.data.length > 0;
        });
    }

    /* The roster check and the first list are two independent reads, so they
       go out together instead of one after the other. A non-admin gets an
       empty list back either way — RLS sees to that — so nothing leaks by
       asking early. */
    function enterPanel(email) {
        return Promise.all([assertAdmin(), fetchAppointments()]).then(function (res) {
            if (!res[0]) {
                return db.auth.signOut().then(function () {
                    throw new Error("This account does not have administrator rights.");
                });
            }
            showPanel(email);
            rows.appointments = res[1] || [];
            paintAppointments();
        });
    }

    function boot() {
        db.auth.getSession().then(function (res) {
            var session = res.data && res.data.session;
            if (!session) return showGate();

            enterPanel(session.user.email).catch(function (err) {
                showGate((err && err.message) || "Could not verify your access. Please try again.");
            });
        });
    }

    $("#admLoginForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = $("#admLoginBtn");
        var email = $("#admEmail").value.trim();
        var pass = $("#admPass").value;

        btn.disabled = true;
        btn.textContent = "Signing in…";
        $("#admLoginError").hidden = true;

        db.auth.signInWithPassword({ email: email, password: pass }).then(function (res) {
            if (res.error) throw res.error;
            return enterPanel(res.data.user.email).then(function () {
                $("#admPass").value = "";
                hidePassword();
            });
        }).catch(function (err) {
            var m = err && err.message || "Could not sign in";
            if (/invalid login/i.test(m)) m = "Incorrect email or password.";
            showGate(m);
        }).then(function () {
            btn.disabled = false;
            btn.textContent = "Sign in";
        });
    });

    /* Reveal the password while typing it. The caret is put back where it was:
       flipping the input's type moves it to the end otherwise, which is
       maddening when you are checking a character mid-word. */
    $("#admPassToggle").addEventListener("click", function () {
        var input = $("#admPass");
        var btn = this;
        var shown = input.type === "text";
        var at = input.selectionStart;

        input.type = shown ? "password" : "text";
        btn.setAttribute("aria-pressed", String(!shown));
        btn.setAttribute("aria-label", shown ? "Show password" : "Hide password");

        input.focus();
        try { input.setSelectionRange(at, at); } catch (e) { /* not all types allow it */ }
    });

    /* Never leave it revealed for the next person at this screen. */
    function hidePassword() {
        var input = $("#admPass");
        var btn = $("#admPassToggle");
        input.type = "password";
        btn.setAttribute("aria-pressed", "false");
        btn.setAttribute("aria-label", "Show password");
    }

    $("#admLogout").addEventListener("click", function () {
        db.auth.signOut().then(function () { showGate(); });
    });

    /* ---- Tabs ----------------------------------------------------------- */

    var LOADERS = {
        appointments: loadAppointments,
        orders: loadOrders,
        barbers: loadBarbers,
        gallery: loadGallery,
        services: loadServices,
        products: loadProducts
    };

    var PAINTERS = {
        appointments: paintAppointments,
        orders: paintOrders,
        barbers: paintBarbers,
        gallery: paintGallery,
        services: paintServices,
        products: paintProducts
    };

    $("#admTabs").addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-tab]");
        if (!btn) return;
        var tab = btn.getAttribute("data-tab");

        $$("#admTabs button").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        $$(".adm-tabpanel").forEach(function (p) {
            p.classList.toggle("is-active", p.getAttribute("data-panel") === tab);
        });

        /* Fetch a section once. Coming back to a tab repaints what is already
           here — the previous version re-downloaded the table on every click. */
        if (rows[tab]) PAINTERS[tab]();
        else LOADERS[tab]();
    });

    /* ---- Editor --------------------------------------------------------- */

    var modalSubmit = null;

    function field(name, label, opts) {
        opts = opts || {};
        var id = "f_" + name;
        var input;

        if (opts.type === "textarea") {
            input = '<textarea id="' + id + '" name="' + name + '">' + esc(opts.value || "") + "</textarea>";
        } else if (opts.type === "select") {
            input = '<select id="' + id + '" name="' + name + '">' +
                opts.options.map(function (o) {
                    return '<option value="' + esc(o.value) + '"' +
                        (String(o.value) === String(opts.value) ? " selected" : "") + ">" + esc(o.label) + "</option>";
                }).join("") + "</select>";
        } else {
            input = '<input id="' + id + '" name="' + name + '" type="' + (opts.type || "text") + '"' +
                (opts.step ? ' step="' + opts.step + '"' : "") +
                (opts.min != null ? ' min="' + opts.min + '"' : "") +
                ' value="' + esc(opts.value == null ? "" : opts.value) + '">';
        }

        return '<div class="adm-field"><label for="' + id + '">' + esc(label) + "</label>" + input + "</div>";
    }

    function openModal(title, html, onSubmit) {
        $("#admModalTitle").textContent = title;
        $("#admModalForm").innerHTML = html;
        $("#admModalError").hidden = true;
        modalSubmit = onSubmit;
        $("#admModal").hidden = false;
        var first = $("#admModalForm input, #admModalForm textarea, #admModalForm select");
        if (first) first.focus();
    }

    function closeModal() {
        $("#admModal").hidden = true;
        modalSubmit = null;
    }

    $("#admModalClose").addEventListener("click", closeModal);
    $("#admModalCancel").addEventListener("click", closeModal);
    $("#admModal").addEventListener("click", function (e) {
        if (e.target === $("#admModal")) closeModal();
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !$("#admModal").hidden) closeModal();
    });

    $("#admModalForm").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!modalSubmit) return;

        var data = {};
        $$("#admModalForm [name]").forEach(function (el) { data[el.name] = el.value.trim(); });

        var btn = $("#admModalSave");
        btn.disabled = true;
        btn.textContent = "Saving…";

        /* modalSubmit is called *inside* the chain, not as an argument to
           Promise.resolve. The validators throw synchronously on bad input,
           and evaluating them one step earlier let the exception escape the
           whole chain: no .catch ran, no message appeared, and the button sat
           on "Saving…" for ever. */
        Promise.resolve().then(function () {
            return modalSubmit(data);
        }).then(function () {
            closeModal();
        }).catch(function (err) {
            var box = $("#admModalError");
            box.textContent = (err && err.message) || "Could not save";
            box.hidden = false;
        }).then(function () {
            btn.disabled = false;
            btn.textContent = "Save";
        });
    });

    /* ---- 1. Appointments ------------------------------------------------ */

    /* Split from the painter so the login can start this read in parallel
       with the roster check. */
    function fetchAppointments() {
        return db.from("appointments")
            .select("id,created_at,name,phone,service,date,time,status,note,barber")
            .order("date", { ascending: false })
            .order("time", { ascending: false })
            .then(function (res) {
                if (res.error) throw res.error;
                return res.data || [];
            });
    }

    /* fetchAppointments already unwraps and throws, so it does not go through
       run() — that helper expects the raw { data, error } envelope. */
    function loadAppointments() {
        return fetchAppointments().then(function (data) {
            rows.appointments = data;
            paintAppointments();
        }).catch(function (err) {
            toast((err && err.message) || "Could not load bookings", true);
        });
    }

    function paintAppointments() {
        var q = $("#apSearch").value.trim().toLowerCase();
        var day = $("#apDate").value;
        var status = $("#apStatus").value;

        /* Filtering happens here, not on the server: the rows are already in
           memory, so typing in the search box costs nothing. */
        var shown = (rows.appointments || []).filter(function (r) {
            if (day && r.date !== day) return false;
            if (status && r.status !== status) return false;
            if (q) {
                var hay = [r.name, r.phone, r.service, r.note, r.barber].join(" ").toLowerCase();
                if (hay.indexOf(q) === -1) return false;
            }
            return true;
        });

        $("#apEmpty").hidden = shown.length > 0;
        $("#apBody").innerHTML = shown.map(function (r) {
            var opts = ["pending", "confirmed", "cancelled"].map(function (s) {
                return '<option value="' + s + '"' + (r.status === s ? " selected" : "") + ">" +
                    esc(STATUS_LABEL[s]) + "</option>";
            }).join("");

            return '<tr data-id="' + r.id + '">' +
                '<td data-label="Client">' + esc(r.name) +
                    (r.note ? '<em class="adm-note">' + esc(r.note) + "</em>" : "") + "</td>" +
                '<td data-label="Phone"><a href="tel:' + esc(r.phone) + '">' + esc(r.phone) + "</a></td>" +
                '<td data-label="Service">' + esc(r.service) +
                    (r.barber ? '<em class="adm-sub">' + esc(r.barber) + "</em>" : "") + "</td>" +
                '<td data-label="Date">' + esc(fmtDate(r.date)) + "</td>" +
                '<td data-label="Time">' + esc(fmtTime(r.time)) + "</td>" +
                '<td data-label="Status"><span class="adm-status" data-s="' + esc(r.status) + '"></span>' +
                    '<select data-act="status">' + opts + "</select></td>" +
                '<td data-label=""><button type="button" class="adm-ghost adm-danger" data-act="delete">Delete</button></td>' +
                "</tr>";
        }).join("");
    }

    ["#apSearch", "#apDate", "#apStatus"].forEach(function (sel) {
        $(sel).addEventListener("input", paintAppointments);
        $(sel).addEventListener("change", paintAppointments);
    });

    $("#apReset").addEventListener("click", function () {
        $("#apSearch").value = "";
        $("#apDate").value = "";
        $("#apStatus").value = "";
        paintAppointments();
    });

    $("#apBody").addEventListener("change", function (e) {
        var sel = e.target.closest('select[data-act="status"]');
        if (!sel) return;
        var id = Number(sel.closest("tr").getAttribute("data-id"));

        /* Paint the new status at once and send the change behind it. The row
           is already correct on screen; if the write fails we repaint from the
           unchanged copy, which puts the old value back. */
        var row = findRow("appointments", id);
        var previous = row && row.status;
        if (row) row.status = sel.value;
        paintAppointments();

        run(db.from("appointments").update({ status: sel.value }).eq("id", id), "Status updated")
            .catch(function () {
                if (row) row.status = previous;
                paintAppointments();
            });
    });

    $("#apBody").addEventListener("click", function (e) {
        var btn = e.target.closest('button[data-act="delete"]');
        if (!btn) return;
        var tr = btn.closest("tr");
        var id = Number(tr.getAttribute("data-id"));
        var who = tr.querySelector("td").textContent;

        if (!window.confirm("Delete the booking for «" + who + "»? This cannot be undone.")) return;

        run(db.from("appointments").delete().eq("id", id), "Booking deleted").then(function () {
            dropRow("appointments", id);
            paintAppointments();
        }).catch(function () {});
    });

    /* ---- 2. Orders ------------------------------------------------------ */

    function loadOrders() {
        return run(
            db.from("orders").select("*").order("created_at", { ascending: false })
        ).then(function (data) {
            rows.orders = data || [];
            paintOrders();
        }).catch(function () {});
    }

    function money(v) {
        return Math.round(Number(v) || 0).toLocaleString("uk-UA") + " ₴";
    }

    /* The address only exists for a delivery; on a pickup these columns are
       null by design, so the block is left out rather than shown empty. */
    function addressOf(o) {
        if (o.delivery_method !== "delivery") return "";
        return [o.city, o.street, o.flat ? "Apt " + o.flat : null, o.zip]
            .filter(Boolean).join(", ");
    }

    function paintOrders() {
        var q = $("#orSearch").value.trim().toLowerCase();
        var status = $("#orStatus").value;
        var method = $("#orMethod").value;

        var shown = (rows.orders || []).filter(function (o) {
            if (status && o.status !== status) return false;
            if (method && o.delivery_method !== method) return false;
            if (q) {
                var hay = [o.order_no, o.customer_name, o.customer_phone,
                           o.customer_email, o.city, o.street].join(" ").toLowerCase();
                if (hay.indexOf(q) === -1) return false;
            }
            return true;
        });

        $("#orEmpty").hidden = shown.length > 0;
        $("#ordersList").innerHTML = shown.map(function (o) {
            var items = (o.items || []).map(function (it) {
                return "<li><span>" + esc(it.name) + " × " + (it.qty || 1) + "</span>" +
                       "<b>" + esc(money((it.price || 0) * (it.qty || 1))) + "</b></li>";
            }).join("");

            var addr = addressOf(o);

            var opts = Object.keys(ORDER_STATUS_LABEL).map(function (k) {
                return '<option value="' + k + '"' + (o.status === k ? " selected" : "") + ">" +
                    esc(ORDER_STATUS_LABEL[k]) + "</option>";
            }).join("");

            /* client_total differs only when the browser sent a figure the
               server disagreed with. Worth seeing; invisible otherwise. */
            var mismatch = (o.client_total != null && Number(o.client_total) !== Number(o.total))
                ? '<p class="adm-warn">The browser sent ' + esc(money(o.client_total)) +
                  " — the server recalculated it to " + esc(money(o.total)) + "</p>"
                : "";

            return '<article class="adm-card adm-order" data-id="' + o.id + '">' +
                '<div class="adm-order-head">' +
                    "<h3>" + esc(o.order_no) + "</h3>" +
                    '<span class="adm-order-total">' + esc(money(o.total)) + "</span>" +
                "</div>" +

                '<span class="adm-card-meta">' + esc(fmtDate(o.created_at)) + " · " +
                    esc(METHOD_LABEL[o.delivery_method] || o.delivery_method) + " · " +
                    esc(PAYMENT_LABEL[o.payment_method] || o.payment_method) + "</span>" +

                '<dl class="adm-kv">' +
                    "<dt>Client</dt><dd>" + esc(o.customer_name) + "</dd>" +
                    '<dt>Phone</dt><dd><a href="tel:' + esc(o.customer_phone) + '">' +
                        esc(o.customer_phone) + "</a></dd>" +
                    (o.customer_email
                        ? '<dt>Email</dt><dd><a href="mailto:' + esc(o.customer_email) + '">' +
                          esc(o.customer_email) + "</a></dd>" : "") +
                    (addr ? "<dt>Address</dt><dd>" + esc(addr) + "</dd>" : "") +
                    (o.comment ? '<dt>Comment</dt><dd class="adm-comment">' + esc(o.comment) + "</dd>" : "") +
                "</dl>" +

                '<ul class="adm-items">' + items + "</ul>" +

                '<div class="adm-order-sums">' +
                    "<span>Items</span><b>" + esc(money(o.goods_total)) + "</b>" +
                    "<span>Delivery</span><b>" +
                        (Number(o.delivery_total) ? esc(money(o.delivery_total)) : "Free") + "</b>" +
                "</div>" +
                mismatch +

                '<div class="adm-card-actions">' +
                    '<select data-act="status">' + opts + "</select>" +
                    '<button type="button" class="adm-ghost adm-danger" data-act="delete">Delete</button>' +
                "</div></article>";
        }).join("");
    }

    ["#orSearch", "#orStatus", "#orMethod"].forEach(function (sel) {
        $(sel).addEventListener("input", paintOrders);
        $(sel).addEventListener("change", paintOrders);
    });

    $("#orReset").addEventListener("click", function () {
        $("#orSearch").value = "";
        $("#orStatus").value = "";
        $("#orMethod").value = "";
        paintOrders();
    });

    $("#ordersList").addEventListener("change", function (e) {
        var sel = e.target.closest('select[data-act="status"]');
        if (!sel) return;
        var id = Number(sel.closest(".adm-order").getAttribute("data-id"));

        var row = findRow("orders", id);
        var previous = row && row.status;
        if (row) row.status = sel.value;
        paintOrders();

        run(db.from("orders").update({ status: sel.value }).eq("id", id), "Status updated")
            .catch(function () {
                if (row) row.status = previous;
                paintOrders();
            });
    });

    $("#ordersList").addEventListener("click", function (e) {
        var btn = e.target.closest('button[data-act="delete"]');
        if (!btn) return;
        var card = btn.closest(".adm-order");
        var id = Number(card.getAttribute("data-id"));
        var no = card.querySelector("h3").textContent;

        if (!window.confirm("Delete order " + no + "? This cannot be undone.")) return;

        run(db.from("orders").delete().eq("id", id), "Order deleted").then(function () {
            dropRow("orders", id);
            paintOrders();
        }).catch(function () {});
    });

    /* ---- 3. Barbers ----------------------------------------------------- */

    function loadBarbers() {
        return run(
            db.from("barbers").select("*").order("sort_order").order("id")
        ).then(function (data) {
            rows.barbers = data || [];
            paintBarbers();
        }).catch(function () {});
    }

    function paintBarbers() {
        $("#barbersList").innerHTML = (rows.barbers || []).map(function (b) {
                return '<article class="adm-card" data-id="' + b.id + '">' +
                    '<img src="' + esc(b.photo_url || "images/placeholder.svg") + '" alt="">' +
                    "<h3>" + esc(label(b, "name")) + "</h3>" +
                    '<span class="adm-card-meta">' + esc(label(b, "role")) +
                        (b.years ? " · " + b.years + " yrs" : "") + "</span>" +
                    "<p>" + esc(label(b, "desc").slice(0, 130)) + "</p>" +
                    '<div class="adm-card-actions">' +
                        '<button type="button" class="adm-ghost" data-act="edit">Edit</button>' +
                        '<label class="adm-ghost" style="cursor:pointer">Photo' +
                            '<input type="file" accept="image/*" data-act="photo" hidden></label>' +
                        '<button type="button" class="adm-ghost adm-danger" data-act="delete">Delete</button>' +
                    "</div></article>";
        }).join("") || '<p class="adm-empty">No barbers yet.</p>';
    }

    function barberForm(b) {
        b = b || {};
        return field("slug", "Code (Latin letters, unique)", { value: b.slug || "" }) +
            '<div class="adm-row">' +
                field("name_ua", "Name (UA)", { value: b.name_ua || "" }) +
                field("name_en", "Name (EN)", { value: b.name_en || "" }) +
            "</div>" +
            '<div class="adm-row">' +
                field("role_ua", "Role (UA)", { value: b.role_ua || "" }) +
                field("role_en", "Role (EN)", { value: b.role_en || "" }) +
            "</div>" +
            field("desc_ua", "Description (UA)", { type: "textarea", value: b.desc_ua || "" }) +
            field("desc_en", "Description (EN)", { type: "textarea", value: b.desc_en || "" }) +
            '<div class="adm-row">' +
                field("tags_ua", "Tags UA (comma separated)", { value: (b.tags_ua || []).join(", ") }) +
                field("tags_en", "Tags EN (comma separated)", { value: (b.tags_en || []).join(", ") }) +
            "</div>" +
            '<div class="adm-row">' +
                field("years", "Years of experience", { type: "number", min: 0, value: b.years == null ? "" : b.years }) +
                field("sort_order", "Sort order", { type: "number", value: b.sort_order == null ? 0 : b.sort_order }) +
            "</div>" +
            field("photo_url", "Photo path", { value: b.photo_url || "" });
    }

    function barberPayload(d) {
        var tags = function (s) {
            return s ? s.split(",").map(function (x) { return x.trim(); }).filter(Boolean) : [];
        };
        if (!d.slug) throw new Error("A code is required.");
        if (!d.name_ua) throw new Error("The Ukrainian name is required.");
        return {
            slug: d.slug, name_ua: d.name_ua, name_en: d.name_en || null,
            role_ua: d.role_ua || null, role_en: d.role_en || null,
            desc_ua: d.desc_ua || null, desc_en: d.desc_en || null,
            tags_ua: tags(d.tags_ua), tags_en: tags(d.tags_en),
            years: d.years === "" ? null : Number(d.years),
            sort_order: Number(d.sort_order) || 0,
            photo_url: d.photo_url || null
        };
    }

    $("#barberNew").addEventListener("click", function () {
        openModal("New barber", barberForm(), function (d) {
            return run(db.from("barbers").insert(barberPayload(d)).select().single(), "Barber added")
                .then(function (row) { upsertRow("barbers", row); sortRows("barbers"); paintBarbers(); });
        });
    });

    $("#barbersList").addEventListener("click", function (e) {
        var card = e.target.closest(".adm-card");
        if (!card) return;
        var id = Number(card.getAttribute("data-id"));

        if (e.target.closest('[data-act="edit"]')) {
            var b = findRow("barbers", id);
            if (!b) return;
            openModal("Barber — " + label(b, "name"), barberForm(b), function (d) {
                return run(db.from("barbers").update(barberPayload(d)).eq("id", id).select().single(), "Saved")
                    .then(function (row) { upsertRow("barbers", row); sortRows("barbers"); paintBarbers(); });
            });
        }

        if (e.target.closest('[data-act="delete"]')) {
            var name = card.querySelector("h3").textContent;
            if (!window.confirm("Delete the barber «" + name + "»?")) return;
            run(db.from("barbers").delete().eq("id", id), "Barber deleted")
                .then(function () { dropRow("barbers", id); paintBarbers(); }).catch(function () {});
        }
    });

    $("#barbersList").addEventListener("change", function (e) {
        var input = e.target.closest('input[data-act="photo"]');
        if (!input || !input.files.length) return;
        var id = Number(input.closest(".adm-card").getAttribute("data-id"));
        uploadImage(input.files[0], "barbers").then(function (url) {
            return run(db.from("barbers").update({ photo_url: url }).eq("id", id).select().single(), "Photo updated")
                .then(function (row) { upsertRow("barbers", row); paintBarbers(); });
        }).catch(function () {}).then(function () { input.value = ""; });
    });

    /* ---- 4. Gallery ----------------------------------------------------- */

    /* A stable, collision-proof name; the original is kept only as an extension. */
    function uploadImage(file, folder) {
        if (file.size > 5 * 1024 * 1024) {
            toast("That file is larger than 5 MB.", true);
            return Promise.reject(new Error("too large"));
        }
        var ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        var path = folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;

        return db.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false })
            .then(function (res) {
                if (res.error) throw res.error;
                return publicUrl(path);
            }).catch(function (err) {
                toast((err && err.message) || "Could not upload the photo", true);
                throw err;
            });
    }

    function loadGallery() {
        return run(
            db.from("gallery").select("*").order("sort_order").order("id")
        ).then(function (data) {
            rows.gallery = data || [];
            paintGallery();
        }).catch(function () {});
    }

    function paintGallery() {
        $("#galleryList").innerHTML = (rows.gallery || []).map(function (g) {
                return '<article class="adm-card" data-id="' + g.id + '">' +
                    '<img src="' + esc(g.image_url) + '" alt="">' +
                    "<h3>" + esc(label(g, "title") || "Untitled") + "</h3>" +
                    '<span class="adm-card-meta">' + esc(label(g, "caption")) + "</span>" +
                    '<div class="adm-card-actions">' +
                        '<button type="button" class="adm-ghost" data-act="edit">Captions</button>' +
                        '<label class="adm-ghost" style="cursor:pointer">Replace' +
                            '<input type="file" accept="image/*" data-act="replace" hidden></label>' +
                        '<button type="button" class="adm-ghost adm-danger" data-act="delete">Delete</button>' +
                    "</div></article>";
        }).join("") || '<p class="adm-empty">No photos yet.</p>';
    }

    $("#galleryUpload").addEventListener("change", function (e) {
        var files = Array.prototype.slice.call(e.target.files);
        if (!files.length) return;

        /* Files go up together rather than one after another — five photos used
           to mean five uploads and five inserts, strictly in turn. The rows are
           then written in a single insert, and the reply seeds the list, so the
           whole batch costs one upload wave plus one request. */
        var label = $('label[for="galleryUpload"]');
        var restore = label ? label.textContent : "";
        if (label) label.textContent = "Uploading…";

        Promise.all(files.map(function (f) {
            return uploadImage(f, "gallery").catch(function () { return null; });   // skip the bad one, keep the rest
        })).then(function (urls) {
            var ok = urls.filter(Boolean);
            if (!ok.length) return;

            var base = (rows.gallery || []).reduce(function (m, g) {
                return Math.max(m, g.sort_order || 0);
            }, 0);

            return run(db.from("gallery").insert(ok.map(function (url, i) {
                return { image_url: url, sort_order: base + i + 1 };
            })).select(), ok.length + " photo(s) uploaded").then(function (added) {
                (added || []).forEach(function (row) { upsertRow("gallery", row); });
                sortRows("gallery");
                paintGallery();
            });
        }).catch(function () { /* already reported */ }).then(function () {
            e.target.value = "";
            if (label) label.textContent = restore;
        });
    });

    $("#galleryList").addEventListener("click", function (e) {
        var card = e.target.closest(".adm-card");
        if (!card) return;
        var id = Number(card.getAttribute("data-id"));

        if (e.target.closest('[data-act="edit"]')) {
            var g = findRow("gallery", id);
            if (!g) return;
            var html =
                    '<div class="adm-row">' +
                        field("title_ua", "Title (UA)", { value: g.title_ua || "" }) +
                        field("title_en", "Title (EN)", { value: g.title_en || "" }) +
                    "</div>" +
                    '<div class="adm-row">' +
                        field("caption_ua", "Caption (UA)", { value: g.caption_ua || "" }) +
                        field("caption_en", "Caption (EN)", { value: g.caption_en || "" }) +
                    "</div>" +
                    '<div class="adm-row">' +
                        field("span", "Cell size", { type: "select", value: g.span || "", options: [
                            { value: "", label: "Normal" },
                            { value: "tall", label: "Tall" },
                            { value: "wide", label: "Wide" }
                        ] }) +
                        field("sort_order", "Sort order", { type: "number", value: g.sort_order || 0 }) +
                    "</div>";

            openModal("Photo", html, function (d) {
                return run(db.from("gallery").update({
                    title_ua: d.title_ua || null, title_en: d.title_en || null,
                    caption_ua: d.caption_ua || null, caption_en: d.caption_en || null,
                    span: d.span || "", sort_order: Number(d.sort_order) || 0
                }).eq("id", id).select().single(), "Saved")
                    .then(function (row) { upsertRow("gallery", row); sortRows("gallery"); paintGallery(); });
            });
        }

        if (e.target.closest('[data-act="delete"]')) {
            if (!window.confirm("Delete this photo?")) return;
            run(db.from("gallery").delete().eq("id", id), "Photo deleted")
                .then(function () { dropRow("gallery", id); paintGallery(); }).catch(function () {});
        }
    });

    $("#galleryList").addEventListener("change", function (e) {
        var input = e.target.closest('input[data-act="replace"]');
        if (!input || !input.files.length) return;
        var id = Number(input.closest(".adm-card").getAttribute("data-id"));
        uploadImage(input.files[0], "gallery").then(function (url) {
            return run(db.from("gallery").update({ image_url: url }).eq("id", id).select().single(), "Photo replaced")
                .then(function (row) { upsertRow("gallery", row); paintGallery(); });
        }).catch(function () {}).then(function () { input.value = ""; });
    });

    /* ---- 5. Services ---------------------------------------------------- */

    function loadServices() {
        return run(
            db.from("services").select("*").order("sort_order").order("id")
        ).then(function (data) {
            rows.services = data || [];
            paintServices();
        }).catch(function () {});
    }

    function paintServices() {
        $("#servicesList").innerHTML = (rows.services || []).map(function (s) {
                return '<article class="adm-card" data-id="' + s.id + '">' +
                    "<h3>" + esc(label(s, "name")) + "</h3>" +
                    '<span class="adm-card-meta">' + Number(s.price) + " ₴ · " + s.duration_min + " min</span>" +
                    "<p>" + esc(label(s, "desc").slice(0, 140)) + "</p>" +
                    '<div class="adm-card-actions">' +
                        '<button type="button" class="adm-ghost" data-act="edit">Edit</button>' +
                        '<button type="button" class="adm-ghost adm-danger" data-act="delete">Delete</button>' +
                    "</div></article>";
        }).join("") || '<p class="adm-empty">No services yet.</p>';
    }

    function serviceForm(s) {
        s = s || {};
        return field("slug", "Code (Latin letters, unique)", { value: s.slug || "" }) +
            '<div class="adm-row">' +
                field("name_ua", "Name (UA)", { value: s.name_ua || "" }) +
                field("name_en", "Name (EN)", { value: s.name_en || "" }) +
            "</div>" +
            field("desc_ua", "Description (UA)", { type: "textarea", value: s.desc_ua || "" }) +
            field("desc_en", "Description (EN)", { type: "textarea", value: s.desc_en || "" }) +
            '<div class="adm-row">' +
                field("price", "Price, ₴", { type: "number", min: 0, step: "1", value: s.price == null ? "" : Number(s.price) }) +
                field("duration_min", "Duration, min", { type: "number", min: 1, value: s.duration_min || "" }) +
            "</div>" +
            '<div class="adm-row">' +
                field("icon", "Icon", { value: s.icon || "scissors" }) +
                field("sort_order", "Sort order", { type: "number", value: s.sort_order == null ? 0 : s.sort_order }) +
            "</div>";
    }

    function servicePayload(d) {
        if (!d.slug) throw new Error("A code is required.");
        if (!d.name_ua) throw new Error("The Ukrainian name is required.");
        var price = Number(d.price), mins = Number(d.duration_min);
        if (!isFinite(price) || price < 0) throw new Error("Price must be a non-negative number.");
        if (!isFinite(mins) || mins < 1) throw new Error("Duration must be at least 1 minute.");
        return {
            slug: d.slug, name_ua: d.name_ua, name_en: d.name_en || null,
            desc_ua: d.desc_ua || null, desc_en: d.desc_en || null,
            price: price, duration_min: Math.round(mins),
            icon: d.icon || "scissors", sort_order: Number(d.sort_order) || 0
        };
    }

    $("#serviceNew").addEventListener("click", function () {
        openModal("New service", serviceForm(), function (d) {
            return run(db.from("services").insert(servicePayload(d)).select().single(), "Service added")
                .then(function (row) { upsertRow("services", row); sortRows("services"); paintServices(); });
        });
    });

    $("#servicesList").addEventListener("click", function (e) {
        var card = e.target.closest(".adm-card");
        if (!card) return;
        var id = Number(card.getAttribute("data-id"));

        if (e.target.closest('[data-act="edit"]')) {
            var svc = findRow("services", id);
            if (!svc) return;
            openModal("Service — " + label(svc, "name"), serviceForm(svc), function (d) {
                return run(db.from("services").update(servicePayload(d)).eq("id", id).select().single(), "Saved")
                    .then(function (row) { upsertRow("services", row); sortRows("services"); paintServices(); });
            });
        }

        if (e.target.closest('[data-act="delete"]')) {
            var name = card.querySelector("h3").textContent;
            if (!window.confirm("Delete the service «" + name + "»?")) return;
            run(db.from("services").delete().eq("id", id), "Service deleted")
                .then(function () { dropRow("services", id); paintServices(); }).catch(function () {});
        }
    });

    /* ---- 6. Products ---------------------------------------------------- */

    /* The price here is the one the order trigger charges, so editing it is a
       real change, not a display change. The site reads this table too, which
       is what keeps the shelf and the till telling the same story. */

    var CAT_LABEL = {
        styling: "Styling", beard: "Beard", care: "Care",
        tools: "Tools", gift: "Gifts"
    };

    var BADGE_LABEL = { "": "No badge", "new": "New", "best": "Bestseller", "gift": "Gift" };

    function loadProducts() {
        return run(
            db.from("products").select("*").order("sort_order").order("id")
        ).then(function (data) {
            rows.products = data || [];
            paintProducts();
        }).catch(function () {});
    }

    function paintProducts() {
        var cat = $("#prCat").value;
        var shown = (rows.products || []).filter(function (p) {
            return !cat || p.cat === cat;
        });

        $("#productsList").innerHTML = shown.map(function (p) {
            return '<article class="adm-card" data-id="' + esc(p.id) + '">' +
                '<img src="' + esc(p.image || "images/placeholder.svg") + '" alt="">' +
                "<h3>" + esc(label(p, "name")) + "</h3>" +
                '<span class="adm-card-meta">' + Math.round(Number(p.price)) + " ₴ · " +
                    esc(CAT_LABEL[p.cat] || p.cat) +
                    (p.badge ? " · " + esc(BADGE_LABEL[p.badge] || p.badge) : "") +
                    (p.is_active ? "" : " · hidden") + "</span>" +
                "<p>" + esc(label(p, "desc").slice(0, 120)) + "</p>" +
                '<div class="adm-card-actions">' +
                    '<button type="button" class="adm-ghost" data-act="edit">Edit</button>' +
                    '<label class="adm-ghost" style="cursor:pointer">Photo' +
                        '<input type="file" accept="image/*" data-act="photo" hidden></label>' +
                    '<button type="button" class="adm-ghost adm-danger" data-act="delete">Delete</button>' +
                "</div></article>";
        }).join("") || '<p class="adm-empty">No products yet.</p>';
    }

    $("#prCat").addEventListener("change", paintProducts);

    function productForm(p) {
        p = p || {};
        var isNew = !p.id;
        return field("id", "Code (Latin letters, unique)", { value: p.id || "" }) +
            (isNew ? "" : '<p class="adm-hint">The code cannot be changed — placed orders refer to it.</p>') +
            '<div class="adm-row">' +
                field("name_ua", "Name (UA)", { value: p.name_ua || "" }) +
                field("name_en", "Name (EN)", { value: p.name_en || "" }) +
            "</div>" +
            field("desc_ua", "Description (UA)", { type: "textarea", value: p.desc_ua || "" }) +
            field("desc_en", "Description (EN)", { type: "textarea", value: p.desc_en || "" }) +
            '<div class="adm-row">' +
                field("price", "Price, ₴", { type: "number", min: 0, step: "1",
                                            value: p.price == null ? "" : Math.round(Number(p.price)) }) +
                field("cat", "Category", { type: "select", value: p.cat || "styling", options: [
                    { value: "styling", label: "Styling" },
                    { value: "beard",   label: "Beard" },
                    { value: "care",    label: "Care" },
                    { value: "tools",   label: "Tools" },
                    { value: "gift",    label: "Gifts" }
                ] }) +
            "</div>" +
            '<div class="adm-row">' +
                field("badge", "Badge", { type: "select", value: p.badge || "", options: [
                    { value: "",     label: "No badge" },
                    { value: "new",  label: "New" },
                    { value: "best", label: "Bestseller" },
                    { value: "gift", label: "Gift" }
                ] }) +
                field("sort_order", "Sort order", { type: "number", value: p.sort_order == null ? 0 : p.sort_order }) +
            "</div>" +
            '<div class="adm-row">' +
                field("is_active", "In stock", { type: "select",
                    value: p.is_active === false ? "no" : "yes", options: [
                        { value: "yes", label: "Yes" },
                        { value: "no",  label: "No — hide from the site" }
                    ] }) +
                field("image", "Photo path", { value: p.image || "" }) +
            "</div>";
    }

    function productPayload(d, keepId) {
        if (!keepId && !d.id) throw new Error("A code is required.");
        if (!d.name_ua) throw new Error("The Ukrainian name is required.");
        var price = Number(d.price);
        if (!isFinite(price) || price < 0) throw new Error("Price must be a non-negative number.");

        var payload = {
            name_ua: d.name_ua, name_en: d.name_en || null,
            desc_ua: d.desc_ua || null, desc_en: d.desc_en || null,
            price: price,
            cat: d.cat || "styling",
            badge: d.badge || null,
            sort_order: Number(d.sort_order) || 0,
            is_active: d.is_active !== "no",
            image: d.image || null
        };
        if (!keepId) payload.id = d.id;
        return payload;
    }

    $("#productNew").addEventListener("click", function () {
        openModal("New product", productForm(), function (d) {
            return run(db.from("products").insert(productPayload(d)).select().single(), "Product added")
                .then(function (row) { upsertRow("products", row); sortRows("products"); paintProducts(); });
        });
    });

    $("#productsList").addEventListener("click", function (e) {
        var card = e.target.closest(".adm-card");
        if (!card) return;
        var id = card.getAttribute("data-id");   // text key, not a number

        if (e.target.closest('[data-act="edit"]')) {
            var p = findRow("products", id);
            if (!p) return;
            openModal("Product — " + label(p, "name"), productForm(p), function (d) {
                /* The id is the key an order's items point at, so it stays put
                   even though the field is shown. */
                return run(db.from("products").update(productPayload(d, true)).eq("id", id).select().single(), "Saved")
                    .then(function (row) { upsertRow("products", row); sortRows("products"); paintProducts(); });
            });
        }

        if (e.target.closest('[data-act="delete"]')) {
            var name = card.querySelector("h3").textContent;
            if (!window.confirm("Delete the product «" + name + "»?\n\nIf it appears in placed orders, taking it out of stock is safer than deleting it.")) return;
            run(db.from("products").delete().eq("id", id), "Product deleted")
                .then(function () { dropRow("products", id); paintProducts(); }).catch(function () {});
        }
    });

    $("#productsList").addEventListener("change", function (e) {
        var input = e.target.closest('input[data-act="photo"]');
        if (!input || !input.files.length) return;
        var id = input.closest(".adm-card").getAttribute("data-id");
        uploadImage(input.files[0], "products").then(function (url) {
            return run(db.from("products").update({ image: url }).eq("id", id).select().single(), "Photo updated")
                .then(function (row) { upsertRow("products", row); paintProducts(); });
        }).catch(function () {}).then(function () { input.value = ""; });
    });

    /* ---- Go ------------------------------------------------------------- */

    boot();
})();
