"""Generate the four standalone pages from index.html.

The header, footer and every overlay (cart drawer, modals, lightbox, toast)
are lifted straight out of index.html, so all five pages share one definition
by construction. Re-run this script after editing that shared chrome.
"""

import hashlib, io, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
# The site is the directory holding .claude/, found from this file rather than
# written down: an absolute path from one machine makes the script fail for
# anyone who clones the repository.
SITE = os.path.dirname(ROOT)
assert os.path.isfile(os.path.join(SITE, "index.html")), \
    "expected index.html next to .claude/ — got %s" % SITE

# Canonical origin. Every og: and canonical URL is absolute because the
# scrapers that read them do not resolve relative paths.
SITE_URL = "https://barbershop0.netlify.app"


def stamp_assets():
    """Put a content hash in the style.css and script.js URLs.

    Cache headers are a request that a browser re-check a file; a changed URL
    leaves it no choice. Phones were the ones getting this wrong — a visitor
    kept an old script.js and saw content the admin had already edited.

    The hash comes from the file itself, so the URL only moves when the file
    does, and index.html is rewritten in place before the other pages are
    generated from it — they inherit the same stamp.
    """
    index_path = os.path.join(SITE, "index.html")
    html = io.open(index_path, encoding="utf-8").read()

    for asset in ("style.css", "script.js"):
        digest = hashlib.sha1(
            io.open(os.path.join(SITE, asset), "rb").read()).hexdigest()[:8]
        # matches the bare name and any stamp already there, so re-running
        # replaces rather than accumulates
        html = re.sub(
            re.escape(asset) + r'(\?v=[0-9a-f]+)?"',
            asset + "?v=" + digest + '"',
            html)

    io.open(index_path, "w", encoding="utf-8", newline="").write(html)
    return html


src = stamp_assets()


def between(start, end, text=src):
    a = text.index(start)
    b = text.index(end, a) + len(end)
    return text[a:b]


head = between("<head>", "</head>")
header = between("<!-- ===== Header ===== -->", "</header>")
footer = between("<!-- ===== Footer ===== -->", "</footer>\n")
# the closing script tag now carries a ?v= stamp, so match it loosely
_script_tag = re.search(r'<script src="script\.js[^"]*">', src)
assert _script_tag, "script tag not found in index.html"
overlays = src[src.index("<!-- ===== Cart drawer ===== -->"):_script_tag.start()]

# Lifted whole so the page and the home section can never drift apart.
about_section = between('<section class="about" id="about">', "</section>\n")

# On an inner page the section anchors live back on the home page, and the
# topics that now have pages of their own link to those pages.
NAV = [
    ('<a href="#about" class="nav-link"',    '<a href="about.html" class="nav-link"'),
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
               .replace('<a href="#about"', '<a href="about.html"')
               .replace('<a href="#gallery"', '<a href="index.html#gallery"'))


PAGES = {
    "shop": dict(
        title="Магазин — MONARCH Barbershop",
        desc="Професійна косметика та інструменти для догляду від MONARCH: помади, олії, шампуні, бритви.",
        ogTitle="Магазин MONARCH — косметика та інструменти для догляду",
        ogDesc="Помади, олії та шампуні, якими працюють наші майстри. Замовлення онлайн.",
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
        desc="Команда майстрів MONARCH: досвід, спеціалізація та стиль кожного барбера.",
        ogTitle="Майстри MONARCH — оберіть свого барбера",
        ogDesc="Досвід, спеціалізація та стиль кожного майстра. Запис до конкретного барбера онлайн.",
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
        desc="Повний перелік послуг MONARCH із цінами та тривалістю: стрижки, гоління, догляд за бородою.",
        ogTitle="Послуги та ціни MONARCH",
        ogDesc="Стрижки, королівське гоління та догляд за бородою — з тривалістю й ціною кожної послуги.",
        tag="services.tag", h1="services.title", sub="services.sub",
        art="razor",
        body='''        <section class="services section" id="services">
            <div class="container">
                <div class="services-grid" id="servicesGrid"></div>
                <p class="services-note reveal" data-i18n="services.note">* Ціни вказані в гривнях. Вартість може відрізнятися залежно від довжини волосся та обраного майстра.</p>
            </div>
        </section>''',
    ),
    # The lifted section already carries its own tag, heading and slogan, so
    # this page skips the standard page-hero rather than saying it all twice.
    # Only the way back is added.
    "about": dict(
        title="Про нас — MONARCH Barbershop",
        desc="MONARCH — територія чоловіків, які цінують стиль, впевненість та бездоганну якість.",
        ogTitle="Про MONARCH — 12 років і 18 000 клієнтів",
        ogDesc="Територія чоловіків, які цінують стиль, впевненість та бездоганну якість.",
        hero=False,
        body="        " + about_section.rstrip(),
    ),
    "reviews": dict(
        title="Відгуки клієнтів — MONARCH Barbershop",
        desc="Що кажуть про MONARCH наші клієнти: враження від майстрів, атмосфери та результату.",
        ogTitle="Відгуки клієнтів MONARCH",
        ogDesc="Враження гостей про майстрів, атмосферу та результат.",
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

PAGE_HERO = '''        <section class="page-hero">
%(art)s            <div class="container">
                <a class="page-back" href="index.html" data-i18n="nav.home">На головну</a>
                <span class="section-tag" data-i18n="%(tag)s"></span>
                <h1 data-i18n="%(h1)s"></h1>
                <p class="section-sub" data-i18n="%(sub)s"></p>
            </div>
        </section>'''

# For a page whose own content opens with a heading, all the hero would add is
# a second one. This keeps the way back and nothing else.
BACK_BAR = '''        <div class="page-backbar">
            <div class="container">
                <a class="page-back" href="index.html" data-i18n="nav.home">На головну</a>
            </div>
        </div>'''

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

%(top)s

%(body)s

    </main>

%(footer)s

%(overlays)s
    <script src="%(script)s"></script>
</body>

</html>
'''

# The preload and the LocalBusiness block describe the home page specifically,
# so they are cut out of the other five rather than copied into them: no other
# page paints the hero, and one business should be declared once.
HOME_ONLY = re.compile(r"\n[ \t]*<!-- build:home-only.*?/build:home-only -->\n",
                       re.S)


def set_meta(html, ident, value):
    """Replace the content= of the one meta tag carrying `ident`."""
    pat = re.compile(r'(<meta ' + re.escape(ident) + r' content=")[^"]*(">)')
    # a lambda, so a & or \ in the text is not read as a backreference
    out, n = pat.subn(lambda m: m.group(1) + value + m.group(2), html, count=1)
    assert n == 1, "no meta tag matched %s" % ident
    return out


def head_for(cfg, slug):
    """index.html's head carrying this page's own title, text and URLs."""
    url = "%s/%s.html" % (SITE_URL, slug)

    out, n = HOME_ONLY.subn("\n", head)
    assert n == 1, "the build:home-only block is missing from index.html"

    out, n = re.subn(r"<title>.*?</title>", "<title>%s</title>" % cfg["title"],
                     out, count=1, flags=re.S)
    assert n == 1, "no <title> in the head"

    out = set_meta(out, 'name="description"', cfg["desc"])
    out = set_meta(out, 'property="og:title"', cfg["ogTitle"])
    out = set_meta(out, 'property="og:description"', cfg["ogDesc"])
    out = set_meta(out, 'property="og:url"', url)

    out, n = re.subn(r'(<link rel="canonical" href=")[^"]*"',
                     lambda m: m.group(1) + url + '"', out, count=1)
    assert n == 1, "no canonical link in the head"
    return out


for name, cfg in PAGES.items():
    page_head = head_for(cfg, name)

    if cfg.get("hero", True):
        # reviews has no tool of its own, so its hero stays plain
        art = ART % dict(art=cfg["art"]) if cfg.get("art") else ""
        top = PAGE_HERO % dict(art=art, tag=cfg["tag"], h1=cfg["h1"], sub=cfg["sub"])
    else:
        top = BACK_BAR

    out = TEMPLATE % dict(page=name, head=page_head, header=page_header, footer=page_footer,
                          overlays=overlays, body=cfg["body"], top=top,
                          script=_script_tag.group(0)[len('<script src="'):-2])

    path = os.path.join(SITE, name + ".html")
    io.open(path, "w", encoding="utf-8", newline="").write(out)
    print("wrote %-14s %6d bytes" % (name + ".html", len(out)))
