"""Generate the four standalone pages from index.html.

The header, footer and every overlay (cart drawer, modals, lightbox, toast)
are lifted straight out of index.html, so all five pages share one definition
by construction. Re-run this script after editing that shared chrome.
"""

import io, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = r"C:\Users\fireg\OneDrive\Desktop\barber shop"

src = io.open(os.path.join(SITE, "index.html"), encoding="utf-8").read()


def between(start, end, text=src):
    a = text.index(start)
    b = text.index(end, a) + len(end)
    return text[a:b]


head = between("<head>", "</head>")
header = between("<!-- ===== Header ===== -->", "</header>")
footer = between("<!-- ===== Footer ===== -->", "</footer>\n")
overlays = src[src.index("<!-- ===== Cart drawer ===== -->"):src.index('<script src="script.js"')]

# On an inner page the section anchors live back on the home page, and the four
# topics that now have pages of their own link to those pages.
NAV = [
    ('<a href="#about" class="nav-link"',    '<a href="index.html#about" class="nav-link"'),
    ('<a href="#services" class="nav-link"', '<a href="services.html" class="nav-link"'),
    ('<a href="#barbers" class="nav-link"',  '<a href="barbers.html" class="nav-link"'),
    ('<a href="#gallery" class="nav-link"',  '<a href="index.html#gallery" class="nav-link"'),
    ('<a href="#shop" class="nav-link"',     '<a href="shop.html" class="nav-link"'),
    ('<a href="#reviews" class="nav-link"',  '<a href="reviews.html" class="nav-link"'),
    ('<a href="#contacts" class="nav-link"', '<a href="index.html#contacts" class="nav-link"'),
    ('<a href="#home" class="logo"',         '<a href="index.html" class="logo"'),
]

page_header = header
for a, b in NAV:
    assert a in page_header, a
    page_header = page_header.replace(a, b)

# Footer anchors that scroll on the home page must jump back to it from here
page_footer = (footer
               .replace('<a href="#about"', '<a href="index.html#about"')
               .replace('<a href="#gallery"', '<a href="index.html#gallery"'))


PAGES = {
    "shop": dict(
        title="Магазин — MONARCH Barbershop",
        desc="Професійна косметика та інструменти для догляду від MONARCH.",
        tag="shop.tag", h1="shop.title", sub="shop.sub",
        art="brush",
        body='''        <section class="shop section" id="shop">
            <div class="container">
                <div class="shop-filters reveal" id="shopFilters"></div>
                <div class="shop-grid" id="shopGrid"></div>
            </div>
        </section>''',
    ),
    "barbers": dict(
        title="Барбери — MONARCH Barbershop",
        desc="Команда майстрів MONARCH: досвід, спеціалізація та стиль кожного.",
        tag="barbers.tag", h1="barbers.title", sub="barbers.sub",
        art="scissors",
        body='''        <section class="barbers section" id="barbers">
            <div class="container">
                <div class="barbers-grid" id="barbersGrid"></div>
            </div>
        </section>''',
    ),
    "services": dict(
        title="Послуги та ціни — MONARCH Barbershop",
        desc="Повний перелік послуг MONARCH із цінами та тривалістю.",
        tag="services.tag", h1="services.title", sub="services.sub",
        art="razor",
        body='''        <section class="services section" id="services">
            <div class="container">
                <div class="services-grid" id="servicesGrid"></div>
                <p class="services-note reveal" data-i18n="services.note">* Ціни вказані в гривнях. Вартість може відрізнятися залежно від довжини волосся та обраного майстра.</p>
            </div>
        </section>''',
    ),
    "reviews": dict(
        title="Відгуки — MONARCH Barbershop",
        desc="Що кажуть про MONARCH наші клієнти.",
        tag="reviews.tag", h1="reviews.title", sub="reviews.sub",
        # is-grid unwraps the slider into a full list; the controls are hidden
        body='''        <section class="reviews section" id="reviews">
            <div class="container">
                <div class="reviews-viewport is-grid">
                    <div class="reviews-track" id="reviewsTrack"></div>
                </div>
            </div>
        </section>''',
    ),
}

# The tool shot plus a glow behind it. Two layers, because a single one that
# merely tilts reads as a rotating sticker; it is the pair drifting at
# different rates that the eye reads as depth. Both are decorative, so the
# wrapper is aria-hidden and carries no alt text.
ART = '''            <div class="hero-art" aria-hidden="true">
                <span class="hero-art-glow"></span>
                <img class="hero-art-img" src="images/tools/%(art)s.webp"
                     srcset="images/tools/%(art)s-sm.webp 520w, images/tools/%(art)s.webp 900w"
                     sizes="(max-width: 767px) 62vw, min(50vw, 620px)"
                     width="900" height="600" alt="" decoding="async" fetchpriority="low">
            </div>
'''

TEMPLATE = '''<!DOCTYPE html>
<html lang="uk">

%(head)s

<body data-page="%(page)s">

    <a class="skip-link" href="#main" data-i18n="a11y.skip">Перейти до вмісту</a>

    <noscript>
        <style>
            .reveal { opacity: 1 !important; transform: none !important; }
        </style>
    </noscript>

    <div class="scroll-progress" id="scrollProgress"></div>

%(header)s

    <main id="main">

        <section class="page-hero">
%(art)s            <div class="container">
                <a class="page-back" href="index.html" data-i18n="nav.home">На головну</a>
                <span class="section-tag" data-i18n="%(tag)s"></span>
                <h1 data-i18n="%(h1)s"></h1>
                <p class="section-sub" data-i18n="%(sub)s"></p>
            </div>
        </section>

%(body)s

    </main>

%(footer)s

%(overlays)s
    <script src="script.js"></script>
</body>

</html>
'''

for name, cfg in PAGES.items():
    page_head = (head
                 .replace("<title>MONARCH — Barbershop</title>",
                          "<title>%s</title>" % cfg["title"])
                 .replace('<meta name="description" content="MONARCH — преміальний барбершоп у Києві. Чоловічі стрижки, королівське гоління, догляд за бородою.">',
                          '<meta name="description" content="%s">' % cfg["desc"]))

    # reviews has no tool of its own, so its hero stays plain
    art = ART % dict(art=cfg["art"]) if cfg.get("art") else ""

    out = TEMPLATE % dict(page=name, head=page_head, header=page_header, footer=page_footer,
                          overlays=overlays, tag=cfg["tag"], h1=cfg["h1"],
                          sub=cfg["sub"], body=cfg["body"], art=art)

    path = os.path.join(SITE, name + ".html")
    io.open(path, "w", encoding="utf-8", newline="").write(out)
    print("wrote %-14s %6d bytes" % (name + ".html", len(out)))
