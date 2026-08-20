/* ==========================================================================
   MONARCH BARBERSHOP
   Vanilla JS — no dependencies.

   1.  Content data (bilingual)
   2.  UI dictionary
   3.  Helpers
   4.  Language engine
   5.  Renderers
   6.  Cart
   7.  Reviews slider
   8.  Lightbox
   9.  Booking form
   10. Navigation & scroll UX
   11. Boot
   ========================================================================== */

(function () {
    "use strict";

    /* ============ 1. Content data ============ */

    var CURRENCY = "₴"; // hryvnia sign

    var SERVICES = [
        {
            id: "classic",
            icon: "scissors",
            price: 450,
            time: { ua: "45 хв", en: "45 min" },
            ua: { name: "Класична стрижка", desc: "Стрижка ножицями з урахуванням форми голови, типу волосся та вашого стилю життя. Миття, укладка та поради з догляду." },
            en: { name: "Classic Haircut", desc: "A scissor cut shaped to your head, hair type and the way you actually live. Includes wash, styling and honest homecare advice." }
        },
        {
            id: "fade",
            icon: "clipper",
            price: 550,
            time: { ua: "60 хв", en: "60 min" },
            ua: { name: "Skin Fade", desc: "Бездоганний градієнт від нуля — з опрацюванням кожного міліметра переходу. Найпопулярніша послуга MONARCH." },
            en: { name: "Skin Fade", desc: "A flawless gradient worked from zero, with every millimetre of the blend refined by hand. Our most requested service." }
        },
        {
            id: "beard",
            icon: "beard",
            price: 350,
            time: { ua: "30 хв", en: "30 min" },
            ua: { name: "Корекція бороди", desc: "Моделювання форми небезпечною бритвою, контур, окантовка та живильна олія у фінал." },
            en: { name: "Beard Trim", desc: "Shape sculpted with a straight razor, crisp contours, clean lines and a nourishing oil to finish." }
        },
        {
            id: "royal",
            icon: "razor",
            price: 500,
            time: { ua: "50 хв", en: "50 min" },
            ua: { name: "Королівське гоління", desc: "Ритуал у три рушники: розпарювання, гоління небезпечною бритвою, холодний компрес і бальзам після гоління." },
            en: { name: "Royal Shave", desc: "A three-towel ritual: steam, a straight-razor shave, a cold compress and a calming aftershave balm." }
        },
        {
            id: "package",
            icon: "crown",
            price: 750,
            time: { ua: "90 хв", en: "90 min" },
            ua: { name: "Пакет «Волосся + Борода»", desc: "Повний образ за один візит: стрижка, моделювання бороди, гарячий рушник та укладка. Вигода 150 ₴." },
            en: { name: "Hair + Beard Package", desc: "The complete look in one visit: haircut, beard sculpting, hot towel and styling. Saves you 150 UAH." }
        },
        {
            id: "kids",
            icon: "kid",
            price: 350,
            time: { ua: "40 хв", en: "40 min" },
            ua: { name: "Дитяча стрижка", desc: "Для джентльменів до 12 років. Терпляче крісло, мультфільми та жодного поспіху — перший барбершоп має запам’ятатися." },
            en: { name: "Kids Haircut", desc: "For gentlemen under 12. A patient chair, cartoons and zero rush — a first barbershop visit should be a good memory." }
        },
        {
            id: "towel",
            icon: "towel",
            price: 250,
            time: { ua: "20 хв", en: "20 min" },
            ua: { name: "Гарячий рушник", desc: "Ритуал розпарювання з ефірними оліями кедра та лайма. Ідеально як доповнення до стрижки." },
            en: { name: "Hot Towel Service", desc: "A steam ritual with cedar and lime essential oils. The perfect add-on to any cut." }
        },
        {
            id: "headshave",
            icon: "head",
            price: 400,
            time: { ua: "35 хв", en: "35 min" },
            ua: { name: "Гоління голови", desc: "Гладке гоління голови небезпечною бритвою з подальшим зволоженням і матовим фінішем." },
            en: { name: "Head Shave", desc: "A smooth straight-razor head shave, followed by deep hydration and a matte finish." }
        },
        {
            id: "camouflage",
            icon: "brush",
            price: 400,
            time: { ua: "40 хв", en: "40 min" },
            ua: { name: "Камуфляж сивини", desc: "Делікатне тонування, що прибирає сивину на 60–80 % і зберігає природний вигляд волосся." },
            en: { name: "Grey Camouflage", desc: "Subtle toning that softens 60–80% of the grey while keeping your hair looking entirely natural." }
        }
    ];

    var BARBERS = [
        {
            id: "artem",
            photo: "images/your-barbers.webp",
            years: 12,
            ua: {
                name: "Артем Ковальчук",
                role: "Засновник · Майстер-барбер",
                desc: "Заснував MONARCH у 2014-му після семи років у лондонських барбершопах. Працює з класикою так, ніби вона ніколи не виходила з моди.",
                tags: ["Класика", "Помпадур", "Небезпечна бритва"]
            },
            en: {
                name: "Artem Kovalchuk",
                role: "Founder · Master Barber",
                desc: "Founded MONARCH in 2014 after seven years in London barbershops. Works classic cuts as if they never went out of style.",
                tags: ["Classic", "Pompadour", "Straight razor"]
            }
        },
        {
            id: "danylo",
            photo: "images/your-barbers.webp",
            years: 9,
            ua: {
                name: "Данило Мороз",
                role: "Топ-барбер · Fade-спеціаліст",
                desc: "Людина, до якої записуються за градієнтом. Чотириразовий фіналіст української барбер-ліги та наш головний перфекціоніст.",
                tags: ["Skin fade", "Текстура", "Дизайн"]
            },
            en: {
                name: "Danylo Moroz",
                role: "Senior Barber · Fade Specialist",
                desc: "The man you book for the gradient. Four-time finalist of the Ukrainian barber league and our resident perfectionist.",
                tags: ["Skin fade", "Texture", "Hair design"]
            }
        },
        {
            id: "maks",
            photo: "images/your-barbers.webp",
            years: 7,
            ua: {
                name: "Максим Гриценко",
                role: "Барбер · Майстер бороди",
                desc: "Вважає, що борода — це архітектура. Вибудовує форму під лінію щелепи так, що клієнти забувають про фільтри у фото.",
                tags: ["Борода", "Королівське гоління", "Догляд"]
            },
            en: {
                name: "Maksym Hrytsenko",
                role: "Barber · Beard Specialist",
                desc: "Believes a beard is architecture. Builds shape around your jawline so well that clients stop reaching for photo filters.",
                tags: ["Beard", "Royal shave", "Grooming"]
            }
        },
        {
            id: "oleh",
            photo: "images/your-barbers.webp",
            years: 6,
            ua: {
                name: "Олег Савчук",
                role: "Барбер · Колорист",
                desc: "Відповідає за камуфляж сивини та складне тонування. Спокійний темп, тиха музика і абсолютно точний результат.",
                tags: ["Колір", "Камуфляж", "Сучасні форми"]
            },
            en: {
                name: "Oleh Savchuk",
                role: "Barber · Colour Specialist",
                desc: "Handles grey camouflage and complex toning. A calm pace, quiet music and an absolutely precise result.",
                tags: ["Colour", "Camouflage", "Modern cuts"]
            }
        }
    ];

    /* Nine tiles cut from the studio's own contact sheet */
    var GALLERY = [
        { src: "images/gallery/g1.webp", span: "tall", ua: { t: "Простір MONARCH", s: "Інтер’єр" }, en: { t: "The MONARCH Room", s: "Interior" } },
        { src: "images/gallery/g2.webp", span: "",     ua: { t: "Робота майстра", s: "Стрижка" }, en: { t: "In the Chair", s: "Haircut" } },
        { src: "images/gallery/g3.webp", span: "wide", ua: { t: "Сталь і світло", s: "Інструмент" }, en: { t: "Steel & Light", s: "Tools" } },
        { src: "images/gallery/g4.webp", span: "",     ua: { t: "Гарячий рушник", s: "Ритуал" }, en: { t: "Hot Towel", s: "Ritual" } },
        { src: "images/gallery/g5.webp", span: "wide", ua: { t: "Вечір у MONARCH", s: "Зал" }, en: { t: "Evening at MONARCH", s: "The Floor" } },
        { src: "images/gallery/g6.webp", span: "tall", ua: { t: "Точність у деталях", s: "Деталь" }, en: { t: "Down to the Detail", s: "Detail" } },
        { src: "images/gallery/g7.webp", span: "",     ua: { t: "Ідеальний фейд", s: "Результат" }, en: { t: "The Perfect Fade", s: "Result" } },
        { src: "images/gallery/g8.webp", span: "",     ua: { t: "Останній штрих", s: "Фініш" }, en: { t: "Final Touch", s: "Finish" } },
        { src: "images/gallery/g9.webp", span: "wide", ua: { t: "Дзеркальна стіна", s: "Простір" }, en: { t: "The Mirror Wall", s: "Space" } }
    ];

    var PRODUCTS = [
        {
            id: "pomade", image: "images/your-product.webp", price: 620, cat: "styling", badge: "best",
            ua: { name: "Помада Monarch Classic", desc: "Сильна фіксація, глянцевий фініш, легко змивається водою. Аромат кедра й тютюну." },
            en: { name: "Monarch Classic Pomade", desc: "Strong hold, glossy finish, washes out with water alone. Cedar and tobacco scent." }
        },
        {
            id: "wax", image: "images/your-product.webp", price: 540, cat: "styling",
            ua: { name: "Матовий віск Clay", desc: "Матова текстура та еластична фіксація для об’єму й недбалих укладок." },
            en: { name: "Matte Clay Wax", desc: "A matte texture with flexible hold — built for volume and undone, lived-in styling." }
        },
        {
            id: "beard-oil", image: "images/your-product.webp", price: 480, cat: "beard", badge: "new",
            ua: { name: "Олія для бороди Royal", desc: "Аргана, жожоба та вітамін E. Пом’якшує щетину та прибирає свербіж за три дні." },
            en: { name: "Royal Beard Oil", desc: "Argan, jojoba and vitamin E. Softens stubble and ends the itch within three days." }
        },
        {
            id: "sea-salt-spray", image: "images/your-product.webp", price: 450, cat: "styling",
            ua: { name: "Сольовий спрей", desc: "Пляжна текстура та природний об’єм без обтяження. Ідеально під матовий віск." },
            en: { name: "Sea Salt Spray", desc: "Beach texture and natural volume with no weight. Perfect layered under matte clay." }
        },
        {
            id: "shampoo", image: "images/your-product.webp", price: 520, cat: "care",
            ua: { name: "Шампунь Daily Ritual", desc: "Безсульфатна формула з екстрактом хмелю. Щоденне очищення без пересушування." },
            en: { name: "Daily Ritual Shampoo", desc: "A sulphate-free formula with hop extract. Daily cleansing that never strips the hair." }
        },
        {
            id: "conditioner", image: "images/your-product.webp", price: 540, cat: "care",
            ua: { name: "Кондиціонер Smooth", desc: "Пантенол і олія ши повертають волоссю м’якість та керованість після укладки." },
            en: { name: "Smooth Conditioner", desc: "Panthenol and shea butter bring softness and control back after a week of styling." }
        },
        {
            id: "brush", image: "images/your-product.webp", price: 890, cat: "tools", badge: "best",
            ua: { name: "Щітка з кабанячої щетини", desc: "Груша, натуральна щетина. Розподіляє себум по довжині та полірує волосся." },
            en: { name: "Boar Bristle Brush", desc: "Pear wood and natural bristle. Distributes sebum along the length and polishes the hair." }
        },
        {
            id: "comb", image: "images/your-product.webp", price: 320, cat: "tools",
            ua: { name: "Гребінець ручної роботи", desc: "Ацетат целюлози, поліровані зубці. Не електризує волосся та служить роками." },
            en: { name: "Hand-Cut Comb", desc: "Cellulose acetate with polished teeth. No static, no snagging — and it lasts for years." }
        },
        {
            id: "clipper-oil", image: "images/your-product.webp", price: 210, cat: "tools",
            ua: { name: "Олія для машинки", desc: "Технічна олія для ножових блоків. Подовжує ресурс леза у 2–3 рази." },
            en: { name: "Clipper Oil", desc: "Technical oil for blade sets. Extends the life of your blades two to three times over." }
        },
        {
            id: "razor", image: "images/your-product.webp", price: 1650, cat: "tools",
            ua: { name: "Небезпечна бритва Heritage", desc: "Японська сталь, руків’я з горіха. Та сама бритва, якою працюють наші майстри." },
            en: { name: "Heritage Straight Razor", desc: "Japanese steel with a walnut handle. The very razor our barbers work with daily." }
        },
        {
            id: "aftershave", image: "images/your-product.webp", price: 590, cat: "beard",
            ua: { name: "Тонік після гоління", desc: "Без спирту. Заспокоює шкіру, знімає почервоніння та залишає прохолодний шлейф." },
            en: { name: "Aftershave Tonic", desc: "Alcohol-free. Calms the skin, removes redness and leaves a cool, quiet trail." }
        },
        {
            id: "gift-card", image: "images/your-product.webp", price: 1000, cat: "gift", badge: "gift",
            ua: { name: "Подарунковий сертифікат", desc: "Номінал 1000 ₴ на будь-які послуги та товари. У конверті з тисненням, дійсний рік." },
            en: { name: "Gift Card", desc: "1000 UAH toward any service or product. Embossed envelope, valid for twelve months." }
        }
    ];

    var REVIEWS = [
        {
            rating: 5,
            ua: { name: "Андрій Литвин", role: "Клієнт з 2019", text: "Ходжу сюди п’ятий рік і жодного разу не вийшов незадоволеним. Данило робить фейд так, що його помічають навіть колеги по Zoom." },
            en: { name: "Andrii Lytvyn", role: "Client since 2019", text: "Five years in and I have never walked out disappointed. Danylo's fade is so clean that colleagues notice it over a Zoom call." }
        },
        {
            rating: 5,
            ua: { name: "Сергій Демченко", role: "Клієнт з 2021", text: "Королівське гоління — це не послуга, а маленька відпустка. Гарячий рушник, тиша, віскі. Виходиш іншою людиною." },
            en: { name: "Serhii Demchenko", role: "Client since 2021", text: "The royal shave is less a service than a short holiday. Hot towel, silence, whisky. You leave as a different person." }
        },
        {
            rating: 5,
            ua: { name: "Владислав Гончар", role: "Клієнт з 2022", text: "Записався вперше на пробу — залишився назавжди. Артем витратив двадцять хвилин лише на розмову про форму, перш ніж узяти ножиці." },
            en: { name: "Vladyslav Honchar", role: "Client since 2022", text: "Booked once just to try it and stayed for good. Artem spent twenty minutes simply discussing shape before he picked up the scissors." }
        },
        {
            rating: 4,
            ua: { name: "Ігор Пелех", role: "Клієнт з 2023", text: "Ціни вищі за середні по місту, але результат тримається чотири тижні замість двох. Єдине — у суботу краще записуватися заздалегідь." },
            en: { name: "Ihor Pelekh", role: "Client since 2023", text: "Prices sit above the city average, but the cut holds four weeks instead of two. One note: book well ahead for Saturdays." }
        },
        {
            rating: 5,
            ua: { name: "Олександр Ткач", role: "Клієнт з 2018", text: "Максим врятував мою бороду після невдалого експерименту. Тепер довіряю тільки йому і купую тут усю косметику." },
            en: { name: "Oleksandr Tkach", role: "Client since 2018", text: "Maksym rescued my beard after a failed experiment. Now he is the only one I trust, and I buy all my products here too." }
        },
        {
            rating: 5,
            ua: { name: "Роман Кулик", role: "Клієнт з 2020", text: "Привів сина на першу стрижку — його розважали мультиками, а він навіть не помітив машинки. Це дорогого варте." },
            en: { name: "Roman Kulyk", role: "Client since 2020", text: "Brought my son in for his first haircut. They kept him laughing at cartoons and he never even noticed the clippers. Worth everything." }
        },
        {
            rating: 5,
            ua: { name: "Дмитро Бондаренко", role: "Клієнт з 2022", text: "Атмосфера — окрема історія. Приглушене світло, вініл і жодного відчуття конвеєра. Тут дійсно ніхто нікуди не поспішає." },
            en: { name: "Dmytro Bondarenko", role: "Client since 2022", text: "The atmosphere is its own story. Low light, vinyl records and no conveyor-belt feeling. Nobody here is in a hurry." }
        },
        {
            rating: 5,
            ua: { name: "Назар Приходько", role: "Клієнт з 2024", text: "Замовляв помаду з доставкою — приїхала наступного дня з рукописною запискою. Дрібниця, а запам’яталося." },
            en: { name: "Nazar Prykhodko", role: "Client since 2024", text: "Ordered the pomade online and it arrived next day with a handwritten note. A small thing, but I remembered it." }
        }
    ];

    var SHOP_CATS = [
        { id: "all",     ua: "Усі товари",  en: "All products" },
        { id: "styling", ua: "Стайлінг",    en: "Styling" },
        { id: "beard",   ua: "Борода",      en: "Beard" },
        { id: "care",    ua: "Догляд",      en: "Hair care" },
        { id: "tools",   ua: "Інструменти", en: "Tools" },
        { id: "gift",    ua: "Подарунки",   en: "Gifts" }
    ];

    var ICONS = {
        scissors: '<path d="M6 6l12 12M18 6L6 18"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/>',
        clipper: '<rect x="7" y="3.5" width="10" height="9" rx="2"/><path d="M8.5 12.5h7l1.5 8H7z"/><path d="M6 21h12"/>',
        beard: '<path d="M5 4v7a7 7 0 0 0 14 0V4"/><path d="M8.5 8h.01M15.5 8h.01"/><path d="M9 14a3.5 3.5 0 0 0 6 0"/>',
        razor: '<path d="M3 13h11a3 3 0 0 1 0 6H3z"/><path d="M14 10l7-7"/><circle cx="17.5" cy="16" r="1.4"/>',
        crown: '<path d="M3 8l4 4 5-7 5 7 4-4v10H3z"/><path d="M3 21h18"/>',
        kid: '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/><path d="M9 3.5c1.5 2 4.5 2 6 0"/>',
        towel: '<rect x="4" y="6" width="16" height="12" rx="3"/><path d="M8 6v12M4 12h4"/>',
        head: '<path d="M12 3a7 7 0 0 1 7 7v3l1.5 2.5-2 .8V19a2 2 0 0 1-2 2h-3v-3"/><path d="M5 12a7 7 0 0 1 7-9"/>',
        brush: '<ellipse cx="12" cy="9" rx="6" ry="5"/><path d="M10 14h4v5a2 2 0 0 1-4 0z"/><path d="M9 4.5V3M15 4.5V3M12 3.8V2"/>'
    };

    /* ============ 2. UI dictionary ============ */

    var I18N = {
        ua: {
            "nav.about": "Про нас", "nav.services": "Послуги", "nav.barbers": "Барбери",
            "nav.gallery": "Галерея", "nav.shop": "Магазин", "nav.reviews": "Відгуки", "nav.contacts": "Контакти",

            "hero.eyebrow": "Київ · з {year} року",
            "hero.tagline": "Стиль, що говорить без слів",
            "hero.text": "Преміальні чоловічі стрижки, професійне гоління та бездоганний сервіс для тих, хто цінує якість і впевненість у кожній деталі.",
            "hero.book": "Записатися", "hero.services": "Послуги та ціни",
            "hero.stat1": "років майстерності", "hero.stat2": "задоволених клієнтів", "hero.stat3": "середній рейтинг",

            "about.tag": "Про нас", "about.title": "Про MONARCH",
            "about.p1": "— це більше, ніж барбершоп. Це територія чоловіків, які цінують стиль, впевненість та бездоганну якість у кожній деталі.",
            "about.p2": "Наші майстри поєднують класичні традиції барберингу із сучасними техніками, створюючи образ, який підкреслює вашу індивідуальність, а не ховає її.",
            "about.p3": "Приглушене світло, витримане дерево, аромат кедру та келих віскі в руці — ми створили простір, куди хочеться повертатися не лише за стрижкою.",
            "about.slogan": "MONARCH — керуй своїм стилем.",
            "about.v1t": "Майстерність", "about.v1d": "Кожен барбер — з досвідом від 6 років та щорічним навчанням у Лондоні й Варшаві.",
            "about.v2t": "Матеріали", "about.v2d": "Тільки професійна косметика преміум-класу та японська сталь інструментів.",
            "about.v3t": "Ритуал", "about.v3d": "Гарячий рушник, напій на вибір і жодного поспіху — візит триває стільки, скільки потрібно.",

            "services.tag": "Прайс", "services.title": "Послуги",
            "services.sub": "Прозорі ціни без прихованих доплат. Кожна послуга включає консультацію, укладку та каву або віскі.",
            "services.note": "* Ціни вказані в гривнях. Вартість може відрізнятися залежно від довжини волосся та обраного майстра.",
            "services.book": "Записатися на цю послугу",

            "barbers.tag": "Команда", "barbers.title": "Наші барбери",
            "barbers.sub": "Четверо майстрів, кожен зі своїм почерком. Оберіть свого — або довіртеся нашій рекомендації.",
            "barbers.years": "років досвіду", "barbers.book": "Записатися до майстра",

            "gallery.tag": "Портфоліо", "gallery.title": "Галерея",
            "gallery.sub": "Робота наших майстрів та атмосфера, у якій вона народжується.",

            "shop.tag": "Магазин", "shop.title": "Догляд удома",
            "shop.sub": "Ті самі засоби, якими ми працюємо в кріслі. Щоб образ тримався до наступного візиту.",
            "shop.add": "У кошик", "shop.added": "Додано",
            "shop.buyNow": "Замовити",
            "co.directNote": "Замовлення лише на цей товар — кошик залишається без змін.",
            "badge.best": "Хіт продажів", "badge.new": "Новинка", "badge.gift": "Подарунок",

            "reviews.tag": "Відгуки", "reviews.title": "Що кажуть клієнти",
            "reviews.sub": "Понад {count} оцінок із середнім балом {rating} — ось лише кілька з них.",

            "booking.tag": "Запис", "booking.title": "Забронювати крісло",
            "booking.sub": "Залиште заявку — адміністратор передзвонить протягом 15 хвилин, щоб підтвердити час. Або телефонуйте одразу.",
            "booking.p1": "Підтвердження за 15 хвилин",
            "booking.p2": "Безкоштовне скасування за 3 години",
            "booking.p3": "Нагадування у Viber або Telegram",
            "booking.name": "Ваше ім’я", "booking.phone": "Телефон", "booking.service": "Послуга",
            "booking.barber": "Майстер", "booking.date": "Дата", "booking.time": "Час", "booking.note": "Коментар",
            "booking.submit": "Підтвердити запис",
            "booking.success": "Дякуємо! Заявку прийнято — ми зателефонуємо для підтвердження.",
            "booking.any": "Будь-який вільний майстер",
            "booking.choose": "Оберіть послугу",
            "booking.chooseTime": "Оберіть час",
            "err.name": "Вкажіть ім’я (мінімум 2 символи)",
            "err.phone": "Вкажіть коректний номер телефону",
            "err.required": "Це поле обов’язкове",
            "err.date": "Оберіть сьогоднішню або майбутню дату",

            "contacts.tag": "Контакти", "contacts.title": "Знайти нас",
            "contacts.sub": "Завітайте до нас — ми поруч і завжди раді гостям.",
            "contacts.phone": "Телефон", "contacts.email": "Email", "contacts.address": "Адреса",
            "contacts.addressValue": "Ваша локація",
            "contacts.hours": "Графік роботи",
            "contacts.mon": "Пн — Пт", "contacts.sat": "Субота", "contacts.sun": "Неділя",
            "contacts.open": "Зараз відчинено", "contacts.closed": "Зараз зачинено",

            "footer.about": "Преміальний барбершоп у центрі Києва. Класика, доведена до досконалості.",
            "footer.menu": "Навігація", "footer.more": "Ще", "footer.contacts": "Контакти",
            "footer.booking": "Запис онлайн", "footer.rights": "Усі права захищено.",
            "footer.privacy": "Політика конфіденційності", "footer.terms": "Умови користування",

            "cart.title": "Кошик", "cart.subtotal": "Разом",
            "cart.hint": "Доставка Новою поштою — безкоштовно від 1500 ₴.",
            "cart.checkout": "Оформити замовлення",
            "cart.empty": "Ваш кошик порожній. Перейдіть до каталогу, щоб обрати товар.",
            "cart.emptyHint": "Оберіть щось із нашого магазину — ми доставимо за 1–2 дні.",
            "cart.toCatalog": "Перейти до каталогу",
            "cart.remove": "Видалити",
            "cart.added": "додано до кошика",
            "cart.ordered": "Замовлення прийнято! Ми зв’яжемося з вами найближчим часом.",

            "a11y.back": "Назад",
            "nav.home": "На головну",
            "contact.demo": "Це тестові дані",

            "co.contactHint": "Введіть ваші дані для зв'язку",
            "co.methodHint": "Оберіть зручний для вас спосіб доставки",
            "co.paymentHint": "Як вам зручно розрахуватися",
            "co.commentHint": "Додайте будь-яку важливу інформацію для нас",
            "co.yourOrder": "Ваше замовлення",
            "co.goodsCount": "Товари ({n})",
            "co.terms": "Натискаючи кнопку, ви погоджуєтесь з умовами обробки даних",
            "co.trust1t": "100% оригінал",
            "co.trust1d": "Гарантуємо оригінальність усіх товарів",
            "co.trust2t": "Швидка обробка",
            "co.trust2d": "Обробляємо замовлення протягом 15 хвилин",
            "co.trust3t": "Підтримка",
            "co.trust3d": "Допоможемо з будь-яким питанням",
            "co.contact": "Контактні дані",
            "co.email": "Email (за бажанням)",
            "co.method": "Спосіб отримання",
            "co.pickup": "Самовивіз",
            "co.pickupInfo": "Заберіть замовлення в салоні у зручний для вас час.",
            "co.delivery": "Доставка",
            "co.city": "Місто",
            "co.street": "Вулиця та будинок",
            "co.flat": "Квартира / офіс",
            "co.zip": "Індекс",
            "co.payment": "Оплата",
            "co.cash": "Готівка при отриманні",
            "co.card": "Картка при отриманні",
            "co.online": "Онлайн-оплата",
            "co.soon": "Скоро",
            "co.commentTitle": "Коментар",
            "co.comment": "Коментар до замовлення",
            "co.commentPh": "Побажання до замовлення",
            "co.goods": "Товари",
            "co.total": "Разом",
            "co.free": "Безкоштовно",
            "co.freeFrom": "Безкоштовна доставка від {n}",
            "co.minOrder": "Мінімальна сума замовлення — {n}",
            "co.minOrderLeft": "Додайте товарів ще на {n}",
            "co.checkoutTitle": "Оформлення замовлення",
            "co.submit": "Підтвердити замовлення",
            "co.continue": "Продовжити покупки",
            "co.doneTitle": "Замовлення прийнято",
            "co.doneMsg": "Дякуємо! Ми зателефонуємо найближчим часом, щоб підтвердити деталі.",
            "co.orderNo": "Номер замовлення",
            "co.recapMethod": "Отримання",
            "co.recapPayment": "Оплата",
            "co.recapTotal": "До сплати",
            "err.phoneUa": "Введіть український номер у форматі +380 XX XXX XX XX",
            "err.phoneIntl": "Введіть коректний номер для обраної країни",
            "err.zip": "Вкажіть поштовий індекс",
            "co.country": "Країна",
            "co.flatOpt": "Квартира / офіс (необов’язково)",
            "err.city": "Вкажіть місто або населений пункт",
            "err.street": "Вкажіть вулицю та номер будинку",
            "co.status": "Статус",
            "err.email": "Вкажіть коректний email",
            "explore.tag": "Розділи",
            "explore.title": "Куди далі",
            "explore.aria": "Розділи сайту",
            "explore.about": "Хто ми такі",
            "explore.services": "Прайс і тривалість",
            "explore.barbers": "Наша команда",
            "explore.shop": "Догляд удома",
            "explore.reviews": "Що кажуть клієнти",
            "explore.booking": "Оберіть час",
            "explore.contacts": "Графік і адреса",
            "a11y.skip": "Перейти до вмісту",
            "a11y.mainNav": "Головне меню",
            "a11y.call": "Зателефонувати",
            "social.msg": "Ваші соцмережі",
            "contacts.mapNeutral": "Ваша локація",
            "ph.name": "Ваше ім’я",
            "ph.note": "Побажання до стрижки, алергії, зручний час для дзвінка…",
            "a11y.home": "MONARCH — на початок",
            "a11y.language": "Мова / Language",
            "a11y.menu": "Меню",
            "a11y.openCart": "Кошик",
            "a11y.closeCart": "Закрити кошик",
            "a11y.close": "Закрити",
            "a11y.scroll": "Гортати далі",
            "a11y.prevReview": "Попередній відгук",
            "a11y.nextReview": "Наступний відгук",
            "a11y.prevPhoto": "Попереднє фото",
            "a11y.nextPhoto": "Наступне фото",
            "a11y.toTop": "Нагору",
            "a11y.socials": "Соціальні мережі",
            "a11y.footerNav": "Навігація підвалу",
            "a11y.footerNav2": "Додаткова навігація",
            "a11y.map": "MONARCH Barbershop — карта",
            "a11y.slide": "Показати відгук",
            "a11y.inc": "Збільшити кількість",
            "a11y.dec": "Зменшити кількість",
            "a11y.rating": "Оцінка: {n} з 5",
            "a11y.openPhoto": "Відкрити фото"
        },

        en: {
            "nav.about": "About", "nav.services": "Services", "nav.barbers": "Barbers",
            "nav.gallery": "Gallery", "nav.shop": "Shop", "nav.reviews": "Reviews", "nav.contacts": "Contacts",

            "hero.eyebrow": "Kyiv · est. {year}",
            "hero.tagline": "Style that speaks without words",
            "hero.text": "Premium men's haircuts, professional shaving and impeccable service for those who value quality and confidence in every detail.",
            "hero.book": "Book now", "hero.services": "Services & prices",
            "hero.stat1": "years of craft", "hero.stat2": "satisfied clients", "hero.stat3": "average rating",

            "about.tag": "About us", "about.title": "About MONARCH",
            "about.p1": "is more than a barbershop. It is a room for men who value style, confidence and flawless quality in every detail.",
            "about.p2": "Our barbers combine the classic traditions of the craft with modern technique, building a look that reveals your character instead of hiding it.",
            "about.p3": "Low light, aged wood, cedar in the air and a glass of whisky in your hand — we built a place worth returning to for more than the haircut.",
            "about.slogan": "MONARCH — own your style.",
            "about.v1t": "Craft", "about.v1d": "Every barber brings 6+ years behind the chair and trains yearly in London and Warsaw.",
            "about.v2t": "Materials", "about.v2d": "Only premium professional grooming products and Japanese steel in every tool.",
            "about.v3t": "Ritual", "about.v3d": "A hot towel, a drink of your choice and no rush — your visit lasts exactly as long as it should.",

            "services.tag": "Price list", "services.title": "Services",
            "services.sub": "Transparent pricing with no hidden extras. Every service includes a consultation, styling and a coffee or a whisky.",
            "services.note": "* Prices are shown in UAH and may vary with hair length and your chosen barber.",
            "services.book": "Book this service",

            "barbers.tag": "The team", "barbers.title": "Meet our barbers",
            "barbers.sub": "Four masters, each with their own signature. Pick yours — or let us recommend one.",
            "barbers.years": "years of experience", "barbers.book": "Book with this barber",

            "gallery.tag": "Portfolio", "gallery.title": "Gallery",
            "gallery.sub": "The work of our barbers, and the atmosphere it is created in.",

            "shop.tag": "Shop", "shop.title": "Grooming at home",
            "shop.sub": "The same products we use in the chair, so your look holds until your next visit.",
            "shop.add": "Add to cart", "shop.added": "Added",
            "shop.buyNow": "Order",
            "co.directNote": "Ordering this item only — your cart stays untouched.",
            "badge.best": "Bestseller", "badge.new": "New", "badge.gift": "Gift",

            "reviews.tag": "Reviews", "reviews.title": "What clients say",
            "reviews.sub": "Over {count} ratings with a {rating} average — here are just a few of them.",

            "booking.tag": "Booking", "booking.title": "Reserve your chair",
            "booking.sub": "Leave a request and our manager will call within 15 minutes to confirm your slot. Or simply call us now.",
            "booking.p1": "Confirmation within 15 minutes",
            "booking.p2": "Free cancellation up to 3 hours before",
            "booking.p3": "Reminders via Viber or Telegram",
            "booking.name": "Your name", "booking.phone": "Phone", "booking.service": "Service",
            "booking.barber": "Barber", "booking.date": "Date", "booking.time": "Time", "booking.note": "Notes",
            "booking.submit": "Confirm booking",
            "booking.success": "Thank you! Your request is in — we will call you shortly to confirm.",
            "booking.any": "Any available barber",
            "booking.choose": "Choose a service",
            "booking.chooseTime": "Choose a time",
            "err.name": "Please enter your name (2 characters minimum)",
            "err.phone": "Please enter a valid phone number",
            "err.required": "This field is required",
            "err.date": "Please choose today or a future date",

            "contacts.tag": "Contacts", "contacts.title": "Find us",
            "contacts.sub": "Come and see us — we are close by and always glad to have you.",
            "contacts.phone": "Phone", "contacts.email": "Email", "contacts.address": "Address",
            "contacts.addressValue": "Your location",
            "contacts.hours": "Opening hours",
            "contacts.mon": "Mon — Fri", "contacts.sat": "Saturday", "contacts.sun": "Sunday",
            "contacts.open": "Open now", "contacts.closed": "Closed now",

            "footer.about": "A premium barbershop in central Kyiv. Classic craft, taken to its limit.",
            "footer.menu": "Navigation", "footer.more": "More", "footer.contacts": "Contacts",
            "footer.booking": "Book online", "footer.rights": "All rights reserved.",
            "footer.privacy": "Privacy policy", "footer.terms": "Terms of use",

            "cart.title": "Your cart", "cart.subtotal": "Total",
            "cart.hint": "Free nationwide delivery on orders over 1500 UAH.",
            "cart.checkout": "Checkout",
            "cart.empty": "Your cart is empty. Head to the catalogue to choose a product.",
            "cart.emptyHint": "Pick something from our shop — we deliver within 1–2 days.",
            "cart.toCatalog": "Go to catalogue",
            "cart.remove": "Remove",
            "cart.added": "added to cart",
            "cart.ordered": "Order received! We will be in touch with you shortly.",

            "a11y.back": "Back",
            "nav.home": "Back to home",
            "contact.demo": "These are demo details",

            "co.contactHint": "How we get back to you",
            "co.methodHint": "Choose how you would like to receive it",
            "co.paymentHint": "However it suits you to pay",
            "co.commentHint": "Anything else we should know",
            "co.yourOrder": "Your order",
            "co.goodsCount": "Items ({n})",
            "co.terms": "By placing the order you agree to our data processing terms",
            "co.trust1t": "100% genuine",
            "co.trust1d": "Every product guaranteed original",
            "co.trust2t": "Fast handling",
            "co.trust2d": "Orders processed within 15 minutes",
            "co.trust3t": "Support",
            "co.trust3d": "We will help with any question",
            "co.contact": "Contact details",
            "co.email": "Email (optional)",
            "co.method": "Collection method",
            "co.pickup": "Pickup",
            "co.pickupInfo": "Collect your order at the salon whenever it suits you.",
            "co.delivery": "Delivery",
            "co.city": "City",
            "co.street": "Street and building",
            "co.flat": "Flat / office",
            "co.zip": "Postcode",
            "co.payment": "Payment",
            "co.cash": "Cash on collection",
            "co.card": "Card on collection",
            "co.online": "Pay online",
            "co.soon": "Soon",
            "co.commentTitle": "Note",
            "co.comment": "Order note",
            "co.commentPh": "Anything we should know",
            "co.goods": "Items",
            "co.total": "Total",
            "co.free": "Free",
            "co.freeFrom": "Free delivery over {n}",
            "co.minOrder": "Minimum order is {n}",
            "co.minOrderLeft": "Add {n} more to check out",
            "co.checkoutTitle": "Checkout",
            "co.submit": "Place order",
            "co.continue": "Continue shopping",
            "co.doneTitle": "Order received",
            "co.doneMsg": "Thank you! We will call you shortly to confirm the details.",
            "co.orderNo": "Order number",
            "co.recapMethod": "Collection",
            "co.recapPayment": "Payment",
            "co.recapTotal": "To pay",
            "err.phoneUa": "Enter a Ukrainian number in the format +380 XX XXX XX XX",
            "err.phoneIntl": "Enter a valid number for the selected country",
            "err.zip": "Enter a postcode",
            "co.country": "Country",
            "co.flatOpt": "Flat / office (optional)",
            "err.city": "Enter your city or settlement",
            "err.street": "Enter the street and building number",
            "co.status": "Status",
            "err.email": "Please enter a valid email",
            "explore.tag": "Sections",
            "explore.title": "Where next",
            "explore.aria": "Site sections",
            "explore.about": "Who we are",
            "explore.services": "Prices and duration",
            "explore.barbers": "Our team",
            "explore.shop": "Grooming at home",
            "explore.reviews": "What clients say",
            "explore.booking": "Pick a time",
            "explore.contacts": "Hours and address",
            "a11y.skip": "Skip to content",
            "a11y.mainNav": "Main menu",
            "a11y.call": "Call us",
            "social.msg": "Your social media",
            "contacts.mapNeutral": "Your location",
            "ph.name": "Your name",
            "ph.note": "Styling preferences, allergies, a good time to call…",
            "a11y.home": "MONARCH — back to top",
            "a11y.language": "Language / Мова",
            "a11y.menu": "Menu",
            "a11y.openCart": "Cart",
            "a11y.closeCart": "Close cart",
            "a11y.close": "Close",
            "a11y.scroll": "Scroll down",
            "a11y.prevReview": "Previous review",
            "a11y.nextReview": "Next review",
            "a11y.prevPhoto": "Previous photo",
            "a11y.nextPhoto": "Next photo",
            "a11y.toTop": "Back to top",
            "a11y.socials": "Social media",
            "a11y.footerNav": "Footer navigation",
            "a11y.footerNav2": "More links",
            "a11y.map": "MONARCH Barbershop — map",
            "a11y.slide": "Show review",
            "a11y.inc": "Increase quantity",
            "a11y.dec": "Decrease quantity",
            "a11y.rating": "Rated {n} out of 5",
            "a11y.openPhoto": "Open photo"
        }
    };

    /* ============ 3. Helpers ============ */

    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

    var lang = "ua";

    function t(key) {
        var pack = I18N[lang] || I18N.ua;
        return pack[key] !== undefined ? pack[key] : key;
    }

    function loc(item) {
        return item[lang] || item.ua;
    }

    function money(value) {
        return value.toLocaleString(lang === "ua" ? "uk-UA" : "en-US") + " " + CURRENCY;
    }

    function esc(str) {
        return String(str)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function store(key, value) {
        try {
            if (value === undefined) {
                var raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : null;
            }
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            // Private mode or disabled storage — the site stays fully usable.
        }
        return null;
    }

    /* ---- Overlay plumbing: scroll lock and focus management ---------------
       Every overlay (cart drawer, lightbox, mobile menu) shares these so the
       page never ends up half-locked or with focus stranded behind a panel. */

    var openLayers = 0;

    function lockScroll(on) {
        var was = openLayers;
        openLayers = Math.max(0, openLayers + (on ? 1 : -1));

        if (was === 0 && openLayers > 0) {
            // Measure the gutter the scrollbar leaves behind, then give it back
            var before = document.documentElement.clientWidth;
            document.body.classList.add("is-locked");
            var gap = document.documentElement.clientWidth - before;
            document.documentElement.style.setProperty("--sbw", (gap > 0 ? gap : 0) + "px");
        } else if (openLayers === 0) {
            document.body.classList.remove("is-locked");
            document.documentElement.style.setProperty("--sbw", "0px");
        }
    }

    var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]),' +
        'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function focusablesIn(root) {
        return $$(FOCUSABLE, root).filter(function (el) {
            return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement;
        });
    }

    var activeTrap = null;

    function onTrapKeydown(e) {
        if (e.key !== "Tab" || !activeTrap) return;

        var items = focusablesIn(activeTrap.root);
        if (!items.length) {
            e.preventDefault();
            activeTrap.root.focus();
            return;
        }

        var first = items[0];
        var last = items[items.length - 1];
        var current = document.activeElement;

        // Keep Tab cycling inside the panel instead of escaping to the page
        if (!activeTrap.root.contains(current)) {
            e.preventDefault();
            (e.shiftKey ? last : first).focus();
        } else if (e.shiftKey && current === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && current === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function trapFocus(root) {
        activeTrap = { root: root, returnTo: document.activeElement };

        document.addEventListener("keydown", onTrapKeydown, true);

        // The panel may still be mid-transition; retry until focus lands
        var attempts = 0;
        (function place() {
            if (!activeTrap || activeTrap.root !== root) return;

            var items = focusablesIn(root);
            (items[0] || root).focus();

            if (!root.contains(document.activeElement) && ++attempts < 12) {
                setTimeout(place, 50);
            }
        })();
    }

    function releaseFocus(root) {
        if (!activeTrap || activeTrap.root !== root) return;

        var back = activeTrap.returnTo;
        activeTrap = null;
        document.removeEventListener("keydown", onTrapKeydown, true);

        if (back && document.contains(back)) {
            back.focus();
        }
    }

    /* Turns an element into a non-navigating control that announces itself */
    function wireInert(el, messageKey) {
        var announce = function (e) {
            e.preventDefault();
            toast(t(messageKey));
        };

        el.addEventListener("click", announce);
        el.addEventListener("keydown", function (e) {
            if (e.key !== "Enter" && e.key !== " ") return;
            announce(e);
        });
    }

    var toastTimer;
    function toast(message) {
        var el = $("#toast");
        if (!el) return;

        el.textContent = message;
        el.classList.add("is-visible");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            el.classList.remove("is-visible");
        }, 2800);
    }

    function starsMarkup(rating) {
        var star = '<svg viewBox="0 0 24 24"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4 6.2 20.4l1.1-6.4-4.7-4.6 6.5-.9z"/></svg>';
        var empty = star.replace("<svg", '<svg class="is-empty"');
        var out = "";

        for (var i = 1; i <= 5; i++) out += (i <= rating ? star : empty);
        return out;
    }

    var FALLBACK_IMG = "images/placeholder.svg";

    /* Lazy image markup. The error fallback is wired up in JS rather than an
       inline onerror attribute so the page stays compatible with a strict CSP. */
    function imgTag(src, alt) {
        return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">';
    }

    /* Swap any image that fails to load for the local placeholder. */
    function guardImages(root) {
        $$("img", root || document).forEach(function (img) {
            if (img.dataset.guarded) return;
            img.dataset.guarded = "1";

            img.addEventListener("error", function () {
                if (img.getAttribute("src") === FALLBACK_IMG) return;
                img.src = FALLBACK_IMG;
            });

            // An image that already failed before the listener was attached
            if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
                img.src = FALLBACK_IMG;
            }
        });
    }

    /* ============ 4. Language engine ============ */

    function applyStaticTranslations() {
        $$("[data-i18n]").forEach(function (el) {
            var key = el.getAttribute("data-i18n");
            var value = t(key);
            if (value !== key) el.textContent = value;
        });

        // Accessible names must follow the language too, not just visible copy.
        $$("[data-i18n-aria]").forEach(function (el) {
            el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
        });

        $$("[data-i18n-title]").forEach(function (el) {
            el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
        });

        $$("[data-i18n-placeholder]").forEach(function (el) {
            el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
        });
    }

    function setLanguage(next) {
        lang = (next === "en") ? "en" : "ua";
        document.documentElement.lang = (lang === "ua") ? "uk" : "en";
        store("monarch_lang", lang);

        $$(".language button").forEach(function (btn) {
            var on = btn.getAttribute("data-lang") === lang;
            btn.classList.toggle("is-active", on);
            btn.setAttribute("aria-pressed", String(on));
        });

        applyStaticTranslations();
        renderServices();
        renderBarbers();
        renderGallery();
        renderShop();
        renderReviews();
        fillBookingSelects();
        renderCart();
        updateOpenState();

        // A caption left over from the previous language would otherwise stay
        var box = $("#lightbox");
        if (box && !box.hidden) paintLightbox();
        else if ($("#lbCaption")) $("#lbCaption").textContent = "";

        var toastEl = $("#toast");
        if (toastEl && !toastEl.classList.contains("is-visible")) toastEl.textContent = "";

        applyStats();
        renderDirectNotice();

        initPhoneField("coCountry", "coPhone");
        initPhoneField("bkCountry", "bkPhone");
        initPhoneField("mbCountry", "mbPhone");

        // Titles, summary rows and the delivery note all carry translated copy
        setStep(checkout.step);
        updateMethodUI();

        guardImages();
        revealAll();
    }

    /* ============ 5. Renderers ============ */

    function renderServices() {
        var grid = $("#servicesGrid");
        if (!grid) return;

        grid.innerHTML = SERVICES.map(function (s, i) {
            var d = loc(s);
            return '' +
                '<article class="service-card reveal" style="--delay:' + (i % 3) * 90 + 'ms" data-service="' + s.id + '" ' +
                    'role="button" tabindex="0" aria-label="' + esc(d.name + " — " + money(s.price) + ". " + t("services.book")) + '">' +
                    '<span class="service-ico" aria-hidden="true">' +
                        '<svg viewBox="0 0 24 24">' + (ICONS[s.icon] || ICONS.scissors) + '</svg>' +
                    '</span>' +
                    '<div class="service-body">' +
                        '<div class="service-top">' +
                            '<h3>' + esc(d.name) + '</h3>' +
                            '<span class="service-price">' + money(s.price) + '</span>' +
                        '</div>' +
                        '<p>' + esc(d.desc) + '</p>' +
                        '<span class="service-meta">' + esc(loc(s.time)) + '</span>' +
                    '</div>' +
                '</article>';
        }).join("");

        $$(".service-card", grid).forEach(function (card) {
            // Cursor-tracked glow
            card.addEventListener("pointermove", function (e) {
                var r = card.getBoundingClientRect();
                card.style.setProperty("--mx", (e.clientX - r.left) + "px");
                card.style.setProperty("--my", (e.clientY - r.top) + "px");
            });

            // Clicking a service preselects it in the booking form
            var pick = function () {
                bookService(card.getAttribute("data-service"));
            };

            card.addEventListener("click", pick);
            card.addEventListener("keydown", function (e) {
                if (e.key !== "Enter" && e.key !== " ") return;
                e.preventDefault();
                pick();
            });
        });
    }

    function renderBarbers() {
        var grid = $("#barbersGrid");
        if (!grid) return;

        grid.innerHTML = BARBERS.map(function (b, i) {
            var d = loc(b);
            return '' +
                '<article class="barber-card reveal" style="--delay:' + i * 110 + 'ms">' +
                    '<div class="barber-photo">' + imgTag(b.photo, d.name) + '</div>' +
                    '<span class="barber-exp">' + b.years + ' ' + esc(t("barbers.years")) + '</span>' +
                    '<div class="barber-info">' +
                        '<h3>' + esc(d.name) + '</h3>' +
                        '<span class="barber-role">' + esc(d.role) + '</span>' +
                        '<p>' + esc(d.desc) + '</p>' +
                        '<ul class="barber-tags">' +
                            d.tags.map(function (tag) { return '<li>' + esc(tag) + '</li>'; }).join("") +
                        '</ul>' +
                        '<button type="button" class="barber-book" data-barber="' + b.id + '">' +
                            esc(t("barbers.book")) +
                        '</button>' +
                    '</div>' +
                '</article>';
        }).join("");

        $$(".barber-book", grid).forEach(function (btn) {
            btn.addEventListener("click", function () {
                bookBarber(btn.getAttribute("data-barber"));
            });
        });
    }

    function renderGallery() {
        var grid = $("#galleryGrid");
        if (!grid) return;

        grid.innerHTML = GALLERY.map(function (g, i) {
            var d = loc(g);
            var url = g.src;

            return '' +
                '<figure class="gallery-item ' + g.span + ' reveal" style="--delay:' + (i % 4) * 80 + 'ms" ' +
                    'data-index="' + i + '" tabindex="0" role="button" ' +
                    'aria-label="' + esc(t("a11y.openPhoto") + ": " + d.t) + '">' +
                    imgTag(url, d.t) +
                    '<span class="gallery-zoom" aria-hidden="true">' +
                        '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5"/></svg>' +
                    '</span>' +
                    '<figcaption class="gallery-cap">' +
                        '<span>' + esc(d.s) + '</span>' +
                        '<strong>' + esc(d.t) + '</strong>' +
                    '</figcaption>' +
                '</figure>';
        }).join("");

        $$(".gallery-item", grid).forEach(function (item) {
            var open = function () {
                openLightbox(parseInt(item.getAttribute("data-index"), 10));
            };

            item.addEventListener("click", open);
            item.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    open();
                }
            });
        });
    }

    function catName(id) {
        for (var i = 0; i < SHOP_CATS.length; i++) {
            if (SHOP_CATS[i].id === id) return SHOP_CATS[i][lang] || SHOP_CATS[i].ua;
        }
        return id;
    }

    function filterShop(cat) {
        $$("#shopGrid .product").forEach(function (card) {
            card.classList.toggle("is-hidden", !(cat === "all" || card.getAttribute("data-cat") === cat));
        });
    }

    function renderShop() {
        var filters = $("#shopFilters");
        var grid = $("#shopGrid");
        if (!grid) return;

        var current = filters && $(".filter-btn.is-active", filters);
        var activeCat = current ? current.getAttribute("data-cat") : "all";

        if (filters) {
            filters.innerHTML = SHOP_CATS.map(function (c) {
                return '<button type="button" class="filter-btn' + (c.id === activeCat ? " is-active" : "") +
                    '" data-cat="' + c.id + '" aria-pressed="' + (c.id === activeCat) + '">' +
                    esc(c[lang] || c.ua) + '</button>';
            }).join("");

            $$(".filter-btn", filters).forEach(function (btn) {
                btn.addEventListener("click", function () {
                    $$(".filter-btn", filters).forEach(function (b) {
                        b.classList.remove("is-active");
                        b.setAttribute("aria-pressed", "false");
                    });
                    btn.classList.add("is-active");
                    btn.setAttribute("aria-pressed", "true");
                    filterShop(btn.getAttribute("data-cat"));
                });
            });
        }

        grid.innerHTML = PRODUCTS.map(function (p, i) {
            var d = loc(p);
            return '' +
                '<article class="product reveal" style="--delay:' + (i % 4) * 80 + 'ms" data-cat="' + p.cat + '">' +
                    '<div class="product-media">' +
                        imgTag(p.image, d.name) +
                        (p.badge ? '<span class="product-badge">' + esc(t("badge." + p.badge)) + '</span>' : "") +
                    '</div>' +
                    '<div class="product-body">' +
                        '<span class="product-cat">' + esc(catName(p.cat)) + '</span>' +
                        '<h3>' + esc(d.name) + '</h3>' +
                        '<p>' + esc(d.desc) + '</p>' +
                        '<div class="product-foot">' +
                            '<span class="product-price">' + money(p.price) + '</span>' +
                            '<div class="product-actions">' +
                                '<button type="button" class="add-btn" data-add="' + p.id + '">' +
                                    '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>' +
                                    '<span>' + esc(t("shop.add")) + '</span>' +
                                '</button>' +
                                '<button type="button" class="buy-btn" data-buy="' + p.id + '">' +
                                    esc(t("shop.buyNow")) +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</article>';
        }).join("");

        $$("[data-add]", grid).forEach(function (btn) {
            btn.addEventListener("click", function () {
                addToCart(btn.getAttribute("data-add"));

                var label = $("span", btn);

                /* "У кошик" and "Додано" are different lengths, so swapping the
                   label would resize the button and shove the price sideways.
                   Pin the current width for the duration of the confirmation. */
                btn.style.minWidth = btn.getBoundingClientRect().width + "px";
                btn.classList.add("is-added");
                if (label) label.textContent = t("shop.added");

                setTimeout(function () {
                    btn.classList.remove("is-added");
                    if (label) label.textContent = t("shop.add");
                    btn.style.minWidth = "";
                }, 1400);
            });
        });

        /* "Buy now" is a shortcut, not a rival to "add to cart": it puts the
           item in the same cart and jumps straight to the details step. */
        $$("[data-buy]", grid).forEach(function (btn) {
            btn.addEventListener("click", function () {
                buyNow(btn.getAttribute("data-buy"));
            });
        });

        filterShop(activeCat);
    }

    function buyNow(id) {
        var product = findProduct(id);
        if (!product) return;

        // The basket is deliberately left exactly as the customer left it
        enterDirectMode(id);

        if (shortfall() > 0) {
            exitDirectMode();
            toast(t("co.minOrder").replace("{n}", money(CHECKOUT_CONFIG.minOrder)));
            return;
        }

        openCart();
        setStep("checkout");
        updateMethodUI();
        renderDirectNotice();
    }

    function renderReviews() {
        var track = $("#reviewsTrack");
        if (!track) return;

        track.innerHTML = REVIEWS.map(function (r) {
            var d = loc(r);
            return '' +
                '<article class="review">' +
                    '<span class="review-quote" aria-hidden="true">&ldquo;</span>' +
                    '<div class="stars" role="img" aria-label="' + esc(t("a11y.rating").replace("{n}", r.rating)) + '">' +
                        starsMarkup(r.rating) + '</div>' +
                    '<p>' + esc(d.text) + '</p>' +
                    '<div class="review-author">' +
                        '<span class="review-avatar" aria-hidden="true">' + esc(d.name.charAt(0)) + '</span>' +
                        '<div>' +
                            '<strong>' + esc(d.name) + '</strong>' +
                            '<span>' + esc(d.role) + '</span>' +
                        '</div>' +
                    '</div>' +
                '</article>';
        }).join("");

        slider.reset();
    }

    /* ============ 6. Cart ============ */

    /* ---- Live figures ------------------------------------------------------
       The hero counters and the review rating come from data, not markup.
       STATS_SOURCE is fetched on every load with caching disabled, so editing
       the file (or pointing this at an API that returns the same shape)
       updates the site with no code change. The built-in values below are the
       fallback used when the fetch cannot run — opening index.html straight
       from disk, for instance, where file:// blocks fetch. */
    var STATS_SOURCE = "data/stats.json";

    var STATS = {
        foundedYear: 2014,
        clients: 18000,
        rating: 4.9,
        reviews: 2400
    };

    /* ---- Orders ------------------------------------------------------------
       Everything the checkout produces goes through OrderStore. It writes to
       localStorage today; swapping in Supabase means editing this one object
       and nothing else in the checkout. The order shape below is already flat
       and snake_cased so it maps straight onto a table row.

       Suggested table (SQL to run in Supabase later):

         create table orders (
           id            uuid primary key default gen_random_uuid(),
           order_no      text unique not null,
           created_at    timestamptz not null default now(),
           status        text not null default 'pending',
           customer_name  text not null,
           customer_phone text not null,
           customer_email text,
           delivery_method text not null,
           city    text,
           street  text,
           flat    text,
           zip     text,
           payment_method text not null,
           comment text,
           items   jsonb not null,
           goods_total    numeric not null,
           delivery_total numeric not null,
           total          numeric not null
         );
    */

    var ORDER_STATUS = {
        pending:    { key: "pending",    ua: "Очікує підтвердження", en: "Awaiting confirmation" },
        confirmed:  { key: "confirmed",  ua: "Підтверджено",         en: "Confirmed" },
        processing: { key: "processing", ua: "В обробці",            en: "Processing" },
        shipped:    { key: "shipped",    ua: "Відправлено",          en: "Shipped" },
        completed:  { key: "completed",  ua: "Виконано",             en: "Completed" },
        cancelled:  { key: "cancelled",  ua: "Скасовано",            en: "Cancelled" }
    };

    /* A new order is never confirmed on the spot — an administrator rings the
       customer first and moves it on from there. */
    var ORDER_INITIAL_STATUS = "pending";

    var OrderStore = {
        /* Replace the body of save() with the Supabase insert and the rest of
           the checkout keeps working unchanged:

             const { data, error } = await supabase
                 .from('orders').insert(order).select().single();
             if (error) throw error;
             return data;
        */
        save: function (order) {
            try {
                var all = store("monarch_orders") || [];
                if (!Array.isArray(all)) all = [];
                all.push(order);
                store("monarch_orders", all.slice(-50));
            } catch (e) {
                /* Storage unavailable — the customer still gets their number. */
            }
            return Promise.resolve(order);
        },

        /* Used by a future admin panel; reads the same shape save() writes. */
        list: function () {
            var all = store("monarch_orders");
            return Promise.resolve(Array.isArray(all) ? all : []);
        },

        /* supabase.from('orders').update({ status }).eq('order_no', orderNo) */
        setStatus: function (orderNo, status) {
            if (!ORDER_STATUS[status]) return Promise.reject(new Error("unknown status: " + status));

            var all = store("monarch_orders") || [];
            if (Array.isArray(all)) {
                all.forEach(function (o) { if (o.order_no === orderNo) o.status = status; });
                store("monarch_orders", all);
            }
            return Promise.resolve(true);
        }
    };

    function statusLabel(key) {
        var s = ORDER_STATUS[key] || ORDER_STATUS[ORDER_INITIAL_STATUS];
        return lang === "ua" ? s.ua : s.en;
    }

    /* ---- Shop rules --------------------------------------------------------
       The three numbers a shop owner actually needs to change. All in UAH. */
    var CHECKOUT_CONFIG = {
        minOrder: 400,          // below this the order cannot be placed (0 = no minimum)
        deliveryCost: 90,       // flat delivery fee
        freeDeliveryFrom: 1500  // delivery becomes free at or above this (0 = never free)
    };

    var MAX_QTY = 99;

    /* Never trust what is already in localStorage: a hand-edited or corrupted
       value used to throw here and abort the whole boot sequence. */
    function sanitiseCart(raw) {
        if (!Array.isArray(raw)) return [];

        var seen = {};
        var clean = [];

        raw.forEach(function (line) {
            if (!line || typeof line !== "object") return;
            if (typeof line.id !== "string" || seen[line.id]) return;
            if (!findProduct(line.id)) return;

            var qty = Math.floor(Number(line.qty));
            if (!isFinite(qty) || qty < 1) return;

            seen[line.id] = true;
            clean.push({ id: line.id, qty: Math.min(qty, MAX_QTY) });
        });

        return clean;
    }

    var cart = sanitiseCart(store("monarch_cart"));

    function findProduct(id) {
        for (var i = 0; i < PRODUCTS.length; i++) {
            if (PRODUCTS[i].id === id) return PRODUCTS[i];
        }
        return null;
    }

    function saveCart() {
        store("monarch_cart", cart);
    }

    function addToCart(id) {
        var product = findProduct(id);
        if (!product) return;

        var line = null;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id === id) { line = cart[i]; break; }
        }

        if (line) {
            if (line.qty >= MAX_QTY) return;
            line.qty += 1;
        } else {
            cart.push({ id: id, qty: 1 });
        }

        saveCart();
        renderCart();
        bumpBadge();
        toast(loc(product).name + " — " + t("cart.added"));
    }

    function setQty(id, delta) {
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].id !== id) continue;

            var next = cart[i].qty + delta;
            if (next < 1) {
                removeFromCart(id);
                return;
            }

            cart[i].qty = Math.min(next, MAX_QTY);

            saveCart();
            renderCart();
            return;
        }
    }

    function removeFromCart(id) {
        var row = $('.cart-item[data-id="' + id + '"]');

        var drop = function () {
            cart = cart.filter(function (line) { return line.id !== id; });
            saveCart();
            renderCart();
        };

        if (row) {
            row.classList.add("is-leaving");
            setTimeout(drop, 300);
        } else {
            drop();
        }
    }

    function cartTotal() {
        return linesTotal(cart);
    }

    function cartCount() {
        return cart.reduce(function (sum, line) { return sum + line.qty; }, 0);
    }

    function bumpBadge() {
        var badge = $("#cartBadge");
        if (!badge) return;

        badge.classList.remove("is-bump");
        void badge.offsetWidth; // restart the keyframes
        badge.classList.add("is-bump");
    }

    function renderCart() {
        var body = $("#cartBody");
        var badge = $("#cartBadge");
        var total = $("#cartTotal");
        if (!body) return;

        // Drop any stored line whose product no longer exists.
        cart = cart.filter(function (line) { return !!findProduct(line.id); });

        var count = cartCount();

        if (badge) {
            badge.textContent = count;
            badge.hidden = (count === 0);
        }

        if (total) total.textContent = money(cartTotal());

        /* Emptying the basket from the details step would strand the customer
           on a form with nothing to buy. */
        if (!cart.length && checkout.step === "checkout" && checkout.mode === "cart") {
            setStep("cart");
        } else {
            renderFoot();
        }

        if (!cart.length) {
            body.innerHTML = '' +
                '<div class="cart-empty">' +
                    '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                        '<path d="M4 5h2.2l2.1 10.3a2 2 0 0 0 2 1.6h7.1a2 2 0 0 0 2-1.5L21 9H7"/>' +
                        '<circle cx="10.5" cy="20" r="1.3"/><circle cx="17.5" cy="20" r="1.3"/>' +
                    '</svg>' +
                    '<p>' + esc(t("cart.empty")) + '</p>' +
                    '<p class="cart-empty-hint">' + esc(t("cart.emptyHint")) + '</p>' +
                    '<button type="button" class="btn cart-empty-cta" id="cartToCatalog">' +
                        esc(t("cart.toCatalog")) +
                    '</button>' +
                '</div>';

            var toCatalog = $("#cartToCatalog", body);
            if (toCatalog) {
                toCatalog.addEventListener("click", function () {
                    closeCart();
                    window.location.href = "shop.html";
                });
            }
            return;
        }

        body.innerHTML = cart.map(function (line) {
            var p = findProduct(line.id);
            var d = loc(p);
            return '' +
                '<div class="cart-item" data-id="' + p.id + '">' +
                    imgTag(p.image, d.name) +
                    '<div>' +
                        '<h4>' + esc(d.name) + '</h4>' +
                        '<div class="cart-item-price">' + money(p.price) + '</div>' +
                        '<div class="qty">' +
                            '<button type="button" data-dec="' + p.id + '" aria-label="' + esc(t("a11y.dec")) + '">&minus;</button>' +
                            '<span aria-live="polite">' + line.qty + '</span>' +
                            '<button type="button" data-inc="' + p.id + '" aria-label="' + esc(t("a11y.inc")) + '">+</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="cart-item-side">' +
                        '<span class="cart-item-total">' + money(p.price * line.qty) + '</span>' +
                        '<button type="button" class="cart-remove" data-remove="' + p.id + '">' + esc(t("cart.remove")) + '</button>' +
                    '</div>' +
                '</div>';
        }).join("");

        guardImages(body);
        updateMethodUI();

        $$("[data-inc]", body).forEach(function (b) {
            b.addEventListener("click", function () { setQty(b.getAttribute("data-inc"), 1); });
        });
        $$("[data-dec]", body).forEach(function (b) {
            b.addEventListener("click", function () { setQty(b.getAttribute("data-dec"), -1); });
        });
        $$("[data-remove]", body).forEach(function (b) {
            b.addEventListener("click", function () { removeFromCart(b.getAttribute("data-remove")); });
        });
    }

    function openCart() {
        var drawer = $("#cartDrawer");
        var backdrop = $("#cartBackdrop");
        if (!drawer || drawer.classList.contains("is-open")) return;

        backdrop.hidden = false;
        void backdrop.offsetWidth;
        backdrop.classList.add("is-open");

        drawer.classList.add("is-open");
        drawer.setAttribute("aria-hidden", "false");
        lockScroll(true);
        trapFocus(drawer);
        pushLayerState("cart");
    }

    function closeCart() {
        var drawer = $("#cartDrawer");
        var backdrop = $("#cartBackdrop");
        if (!drawer || !drawer.classList.contains("is-open")) return;

        drawer.classList.remove("is-open");
        drawer.setAttribute("aria-hidden", "true");
        backdrop.classList.remove("is-open");

        /* Never leave a half-finished direct order armed for the next visit.
           setStep also repaints the footer, which would otherwise still show
           the abandoned product's total instead of the basket's. */
        if (checkout.mode === "direct" && checkout.step !== "done") {
            exitDirectMode();
            renderDirectNotice();
            setStep("cart");
        }

        /* The confirmation is a one-off: closing it returns the drawer to the
           basket rather than leaving a finished order on screen. */
        if (checkout.step === "done") {
            setTimeout(function () {
                exitDirectMode();
                renderDirectNotice();
                setStep("cart");
            }, 450);
        }

        releaseFocus(drawer);
        lockScroll(false);
        popLayerState();

        setTimeout(function () {
            if (!backdrop.classList.contains("is-open")) backdrop.hidden = true;
        }, 500);
    }

    /* ============ 6b. Checkout ============
       The drawer runs three steps — basket, details, confirmation — sharing a
       single footer that reports the running total and drives the next action. */

    /* The checkout runs over one of two independent line sets.

         mode "cart"   — everything currently in the basket
         mode "direct" — a single product ordered straight from its card

       "Замовити" never touches the basket: it neither adds to it, empties it
       nor orders it. The two flows simply operate on different lists. */
    var checkout = {
        step: "cart",
        method: "pickup",
        payment: "cash",
        mode: "cart",
        directItems: []
    };

    function activeLines() {
        return checkout.mode === "direct" ? checkout.directItems : cart;
    }

    function linesTotal(lines) {
        return lines.reduce(function (sum, line) {
            var product = findProduct(line.id);
            return product ? sum + product.price * line.qty : sum;
        }, 0);
    }

    function enterDirectMode(id) {
        checkout.mode = "direct";
        checkout.directItems = [{ id: id, qty: 1 }];
    }

    function exitDirectMode() {
        checkout.mode = "cart";
        checkout.directItems = [];
    }

    /* Names the single product being ordered, so the totals never look like
       they belong to the basket. */
    function renderDirectNotice() {
        var note = $("#coDirect");
        if (!note) return;

        if (checkout.mode !== "direct" || !checkout.directItems.length) {
            note.hidden = true;
            note.textContent = "";
            return;
        }

        var product = findProduct(checkout.directItems[0].id);
        if (!product) { note.hidden = true; return; }

        note.innerHTML = "<strong>" + esc(loc(product).name) + " — " + esc(money(product.price)) + "</strong>" +
            "<span>" + esc(t("co.directNote")) + "</span>";
        note.hidden = false;
    }

    function deliveryFee(goods) {
        if (checkout.method !== "delivery") return 0;
        if (CHECKOUT_CONFIG.freeDeliveryFrom && goods >= CHECKOUT_CONFIG.freeDeliveryFrom) return 0;
        return CHECKOUT_CONFIG.deliveryCost;
    }

    function orderTotals() {
        var goods = linesTotal(activeLines());
        var delivery = deliveryFee(goods);
        return { goods: goods, delivery: delivery, total: goods + delivery };
    }

    function shortfall() {
        return Math.max(0, CHECKOUT_CONFIG.minOrder - linesTotal(activeLines()));
    }

    function setStep(step) {
        checkout.step = step;

        $$(".cart-step").forEach(function (section) {
            section.hidden = section.getAttribute("data-step") !== step;
        });

        var back = $("#cartBack");
        if (back) back.hidden = (step !== "checkout");

        // The order form needs the whole screen; the basket stays a drawer
        var drawer = $("#cartDrawer");
        if (drawer) {
            drawer.classList.toggle("is-fullscreen", step === "checkout" || step === "done");
        }

        var title = $("#cartTitle");
        if (title) {
            title.textContent = step === "checkout" ? t("co.checkoutTitle")
                : step === "done" ? t("co.doneTitle")
                : t("cart.title");
        }

        var scroll = $("#cartScroll");
        if (scroll) scroll.scrollTop = 0;

        renderFoot();
    }

    /* Footer: summary rows, contextual hint and the primary action */
    function renderFoot() {
        var summary = $("#cartSummary");
        var hint = $("#cartHint");
        var asideSubmit = $("#coAsideSubmit");
        if (asideSubmit) asideSubmit.addEventListener("click", placeOrder);

        var primary = $("#cartPrimary");
        if (!summary || !primary) return;

        var sums = orderTotals();

        if (checkout.step === "done") {
            summary.innerHTML = "";
            summary.hidden = true;
            if (hint) hint.hidden = true;
            primary.textContent = t("co.continue");
            primary.disabled = false;
            return;
        }

        summary.hidden = false;

        if (checkout.step === "checkout") {
            renderAside();
            summary.innerHTML =
                row(t("co.goods"), money(sums.goods)) +
                row(t("co.delivery"), sums.delivery ? money(sums.delivery) : t("co.free")) +
                row(t("co.total"), money(sums.total), true);
            primary.textContent = t("co.submit");
        } else {
            summary.innerHTML = row(t("co.total"), money(sums.goods), true);
            primary.textContent = t("cart.checkout");
        }

        primary.disabled = false;

        if (hint) {
            var text = "";
            if (cart.length && shortfall() > 0) {
                text = t("co.minOrderLeft").replace("{n}", money(shortfall()));
            } else if (CHECKOUT_CONFIG.freeDeliveryFrom && sums.goods < CHECKOUT_CONFIG.freeDeliveryFrom) {
                text = t("co.freeFrom").replace("{n}", money(CHECKOUT_CONFIG.freeDeliveryFrom));
            }
            hint.textContent = text;
            hint.hidden = !text;
        }
    }

    /* The order panel beside the form: the same figures the footer carries,
       plus the line items, so the customer can check what they are buying
       without going back a step. */
    function renderAside() {
        var list = $("#coItems");
        var sums = $("#coAsideSums");
        if (!list || !sums) return;

        var lines = activeLines();

        list.innerHTML = lines.map(function (line) {
            var p = findProduct(line.id);
            if (!p) return "";
            var d = loc(p);
            return '<li class="co-item">' +
                imgTag(p.image, d.name) +
                '<span class="co-item-body">' +
                    '<strong>' + esc(d.name) + '</strong>' +
                '</span>' +
                '<span class="co-item-side">' +
                    '<b>' + esc(money(p.price * line.qty)) + '</b>' +
                    '<small>× ' + line.qty + '</small>' +
                '</span>' +
            '</li>';
        }).join("");

        guardImages(list);

        var count = lines.reduce(function (n, l) { return n + l.qty; }, 0);
        var totals = orderTotals();

        sums.innerHTML =
            row(t("co.goodsCount").replace("{n}", count), money(totals.goods)) +
            row(t("co.delivery"), totals.delivery ? money(totals.delivery) : t("co.free")) +
            row(t("co.total"), money(totals.total), true);
    }

    function row(label, value, strong) {
        return '<div class="cart-row' + (strong ? " is-total" : "") + '">' +
            "<span>" + esc(label) + "</span>" +
            (strong ? "<strong>" : "<b>") + esc(value) + (strong ? "</strong>" : "</b>") +
            "</div>";
    }

    function updateMethodUI() {
        var delivery = (checkout.method === "delivery");

        var fields = $("#coDeliveryFields");
        if (fields) fields.hidden = !delivery;

        var pickupInfo = $("#coPickupInfo");
        if (pickupInfo) pickupInfo.hidden = delivery;

        var note = $("#coDeliveryNote");
        if (note) {
            note.textContent = (CHECKOUT_CONFIG.freeDeliveryFrom && cartTotal() >= CHECKOUT_CONFIG.freeDeliveryFrom)
                ? t("co.free")
                : money(CHECKOUT_CONFIG.deliveryCost);
        }

        renderFoot();
    }

    function markOptions(group, value) {
        $$(".co-option", group).forEach(function (opt) {
            var input = $("input", opt);
            opt.classList.toggle("is-selected", !!input && input.value === value);
        });
    }

    /* ---- Field rules -------------------------------------------------------
       Deliberately shape-based, never a lookup: delivery covers the whole of
       Ukraine, so any settlement a customer types has to be accepted. These
       only reject input that cannot be a real value. */

    /* ---- International phone ----------------------------------------------
       Country picker plus a national number. `len` is how many digits the
       national part may have; `first` rules out prefixes the country never
       issues. Add a row here to support another country. */
    var PHONE_COUNTRIES = [
        { iso: "UA", dial: "380", flag: "🇺🇦", len: [9],     first: /^[3-9]/, ua: "Україна",         en: "Ukraine",        mask: "XX XXX XX XX" },
        { iso: "PL", dial: "48",  flag: "🇵🇱", len: [9],     first: /^[4-9]/, ua: "Польща",          en: "Poland",         mask: "XXX XXX XXX" },
        { iso: "DE", dial: "49",  flag: "🇩🇪", len: [10, 11],first: /^[1-9]/, ua: "Німеччина",       en: "Germany",        mask: "XXX XXXXXXX" },
        { iso: "GB", dial: "44",  flag: "🇬🇧", len: [10],    first: /^[1-9]/, ua: "Велика Британія", en: "United Kingdom", mask: "XXXX XXXXXX" },
        { iso: "US", dial: "1",   flag: "🇺🇸", len: [10],    first: /^[2-9]/, ua: "США",             en: "United States",  mask: "XXX XXX XXXX" },
        { iso: "CZ", dial: "420", flag: "🇨🇿", len: [9],     first: /^[2-9]/, ua: "Чехія",           en: "Czechia",        mask: "XXX XXX XXX" },
        { iso: "SK", dial: "421", flag: "🇸🇰", len: [9],     first: /^[2-9]/, ua: "Словаччина",      en: "Slovakia",       mask: "XXX XXX XXX" },
        { iso: "RO", dial: "40",  flag: "🇷🇴", len: [9],     first: /^[2-9]/, ua: "Румунія",         en: "Romania",        mask: "XXX XXX XXX" },
        { iso: "MD", dial: "373", flag: "🇲🇩", len: [8],     first: /^[2-9]/, ua: "Молдова",         en: "Moldova",        mask: "XX XXX XXX" },
        { iso: "CA", dial: "1",   flag: "🇨🇦", len: [10],    first: /^[2-9]/, ua: "Канада",          en: "Canada",         mask: "XXX XXX XXXX" }
    ];

    function countryByIso(iso) {
        for (var i = 0; i < PHONE_COUNTRIES.length; i++) {
            if (PHONE_COUNTRIES[i].iso === iso) return PHONE_COUNTRIES[i];
        }
        return PHONE_COUNTRIES[0];
    }

    /* Validates the national part against the selected country */
    function isValidNationalNumber(country, value) {
        var d = String(value).replace(/\D/g, "");

        // Tolerate a pasted full number that already carries the dial code
        if (d.indexOf(country.dial) === 0 && d.length > country.dial.length) {
            d = d.slice(country.dial.length);
        }
        // …or a national trunk zero
        if (d.length && d.charAt(0) === "0" && country.len.indexOf(d.length - 1) !== -1) {
            d = d.slice(1);
        }

        if (country.len.indexOf(d.length) === -1) return false;
        if (!country.first.test(d)) return false;

        // 000000000 / 999999999 and friends are never real
        if (new RegExp("^(\\d)\\1{" + (d.length - 1) + "}$").test(d)) return false;

        return true;
    }

    /* Fills a country picker and keeps its partner input's hint in step */
    function initPhoneField(selectId, inputId) {
        var select = $("#" + selectId);
        var input = $("#" + inputId);
        if (!select || !input) return;

        var keep = select.value;

        select.innerHTML = PHONE_COUNTRIES.map(function (c) {
            return '<option value="' + c.iso + '">' + c.flag + "  +" + c.dial + "</option>";
        }).join("");

        select.value = keep || "UA";

        var sync = function () {
            var c = countryByIso(select.value);
            input.placeholder = c.mask;
            input.setAttribute("aria-label", (lang === "ua" ? c.ua : c.en) + ", +" + c.dial);
            clearError(input);
        };

        if (!select.dataset.wired) {
            select.dataset.wired = "1";
            select.addEventListener("change", sync);
        }

        sync();
    }

    function phoneCountryFor(inputId) {
        var map = { coPhone: "coCountry", bkPhone: "bkCountry", mbPhone: "mbCountry" };
        var select = $("#" + map[inputId]);
        return countryByIso(select ? select.value : "UA");
    }

    function phoneE164(country, value) {
        var d = String(value).replace(/\D/g, "");
        if (d.indexOf(country.dial) === 0 && d.length > country.dial.length) d = d.slice(country.dial.length);
        if (d.length && d.charAt(0) === "0") d = d.slice(1);
        return "+" + country.dial + d;
    }

    function letterCount(s) {
        return (s.match(/\p{L}/gu) || []).length;
    }

    function isPlausibleName(value) {
        var s = String(value).trim();
        if (s.length < 2) return false;
        if (!/^[\p{L}\s'’\-]+$/u.test(s)) return false;     // letters, spaces, apostrophes, hyphens
        if (letterCount(s) < 2) return false;
        if (/(\p{L})\1{2,}/u.test(s)) return false;         // "аааа", "ssss"
        return /[аеєиіїоуюяыэёaeiouy]/iu.test(s);           // a real name carries a vowel
    }

    /* Any Ukrainian settlement is valid; this only filters out keyboard mash */
    function isPlausiblePlace(value) {
        var s = String(value).trim();
        if (s.length < 2) return false;
        if (!/^[\p{L}\d\s'’.\-]+$/u.test(s)) return false;
        if (letterCount(s) < 2) return false;
        if (/(\p{L})\1{3,}/u.test(s)) return false;
        return /[аеєиіїоуюяыэёaeiouy]/iu.test(s);
    }

    function isPlausibleAddress(value) {
        var s = String(value).trim();
        if (s.length < 4) return false;
        if (letterCount(s) < 2) return false;
        return /^[\p{L}\d\s'’.,/\-№]+$/u.test(s);
    }

    function isEmail(value) {
        var s = String(value).trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;
    }

    function validateCheckout() {
        var ok = true;

        var checks = [
            { el: $("#coName"), test: isPlausibleName, key: "err.name" },
            { el: $("#coPhone"), test: function (v) { return isValidNationalNumber(phoneCountryFor("coPhone"), v); }, key: "err.phoneIntl" },
            { el: $("#coEmail"), test: function (v) { return !v.trim() || isEmail(v); }, key: "err.email" }
        ];

        // Address only matters when something is actually being delivered
        if (checkout.method === "delivery") {
            checks.push({ el: $("#coCity"), test: isPlausiblePlace, key: "err.city" });
            checks.push({ el: $("#coStreet"), test: isPlausibleAddress, key: "err.street" });
            checks.push({ el: $("#coZip"), test: function (v) { return /^\d{4,10}$/.test(String(v).replace(/\D/g, "")) && String(v).trim().length > 0; }, key: "err.zip" });
        }

        checks.forEach(function (c) {
            if (!c.el) return;
            clearError(c.el);
            if (c.test(c.el.value)) return;
            fieldError(c.el, c.key);
            ok = false;
        });

        return ok;
    }

    function placeOrder() {
        if (!validateCheckout()) {
            var bad = $("#checkoutForm .field.has-error input");
            if (bad) bad.focus();
            return;
        }

        var sums = orderTotals();
        var orderNo = "MN-" + Date.now().toString(36).toUpperCase().slice(-6);
        var isDelivery = (checkout.method === "delivery");

        /* Flat, snake_cased and ready to become a Supabase row as-is */
        var order = {
            order_no: orderNo,
            created_at: new Date().toISOString(),
            status: ORDER_INITIAL_STATUS,

            customer_name: $("#coName").value.trim(),
            customer_phone: phoneE164(phoneCountryFor("coPhone"), $("#coPhone").value),
            customer_email: $("#coEmail").value.trim() || null,

            delivery_method: checkout.method,
            city: isDelivery ? $("#coCity").value.trim() : null,
            street: isDelivery ? $("#coStreet").value.trim() : null,
            flat: isDelivery ? ($("#coFlat").value.trim() || null) : null,
            zip: isDelivery ? ($("#coZip").value.trim() || null) : null,

            payment_method: checkout.payment,
            comment: $("#coComment").value.trim() || null,

            items: activeLines().map(function (line) {
                var p = findProduct(line.id);
                return { product_id: p.id, name: loc(p).name, qty: line.qty, price: p.price };
            }),

            goods_total: sums.goods,
            delivery_total: sums.delivery,
            total: sums.total
        };

        OrderStore.save(order).catch(function (err) {
            if (window.console && console.error) console.error("MONARCH order save failed", err);
        });

        var no = $("#coOrderNo");
        if (no) no.textContent = orderNo;

        var statusEl = $("#coOrderStatus");
        if (statusEl) statusEl.textContent = statusLabel(order.status);

        var recap = $("#coRecap");
        if (recap) {
            recap.innerHTML =
                "<dt>" + esc(t("co.recapMethod")) + "</dt><dd>" +
                    esc(t(checkout.method === "delivery" ? "co.delivery" : "co.pickup")) + "</dd>" +
                "<dt>" + esc(t("co.recapPayment")) + "</dt><dd>" +
                    esc(t(checkout.payment === "card" ? "co.card" : "co.cash")) + "</dd>" +
                "<dt>" + esc(t("co.recapTotal")) + "</dt><dd>" + esc(money(sums.total)) + "</dd>";
        }

        /* A direct order clears only itself; the basket is none of its
           business and must survive untouched. */
        if (checkout.mode === "direct") {
            exitDirectMode();
        } else {
            cart = [];
            saveCart();
        }

        renderCart();
        renderDirectNotice();

        $("#checkoutForm").reset();
        setStep("done");
    }

    function initCheckout() {
        var form = $("#checkoutForm");
        if (!form) return;

        var methods = $("#coMethods");
        if (methods) {
            $$('input[name="method"]', methods).forEach(function (input) {
                input.addEventListener("change", function () {
                    checkout.method = input.value;
                    markOptions(methods, input.value);
                    updateMethodUI();
                });
            });
        }

        var payments = $("#coPayments");
        if (payments) {
            $$('input[name="payment"]', payments).forEach(function (input) {
                input.addEventListener("change", function () {
                    checkout.payment = input.value;
                    markOptions(payments, input.value);
                });
            });
        }

        $$("input, textarea", form).forEach(function (el) {
            el.addEventListener("input", function () { clearError(el); });
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            placeOrder();
        });

        var back = $("#cartBack");
        if (back) {
            back.addEventListener("click", function () {
                // Leaving the form abandons a direct order and shows the basket
                exitDirectMode();
                renderDirectNotice();
                setStep("cart");
            });
        }

        var primary = $("#cartPrimary");
        if (primary) {
            primary.addEventListener("click", function () {
                if (checkout.step === "done") {
                    closeCart();
                    setStep("cart");
                    return;
                }

                if (checkout.step === "checkout") {
                    placeOrder();
                    return;
                }

                // Step 1 — guard the two ways forward can fail
                if (!cart.length) {
                    toast(t("cart.empty"));
                    var empty = $(".cart-empty");
                    if (empty) {
                        empty.classList.remove("is-flagged");
                        void empty.offsetWidth;
                        empty.classList.add("is-flagged");
                    }
                    var jump = $("#cartToCatalog");
                    if (jump) jump.focus();
                    return;
                }

                if (shortfall() > 0) {
                    toast(t("co.minOrder").replace("{n}", money(CHECKOUT_CONFIG.minOrder)));
                    return;
                }

                setStep("checkout");
                updateMethodUI();

                var first = $("#coName");
                if (first) setTimeout(function () { first.focus(); }, 80);
            });
        }

        updateMethodUI();
    }

    /* ============ 7. Reviews slider ============ */

    var slider = (function () {
        var index = 0;

        function perView() {
            if (window.innerWidth <= 700) return 1;
            if (window.innerWidth <= 1180) return 2;
            return 3;
        }

        function pages() {
            return Math.max(1, REVIEWS.length - perView() + 1);
        }

        function renderDots() {
            var wrap = $("#reviewsDots");
            if (!wrap) return;

            var total = pages();

            if (wrap.children.length !== total) {
                wrap.innerHTML = "";
                for (var i = 0; i < total; i++) {
                    wrap.appendChild(makeDot(i));
                }
            }

            $$("button", wrap).forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
                if (i === index) dot.setAttribute("aria-current", "true");
                else dot.removeAttribute("aria-current");
                dot.setAttribute("aria-label", t("a11y.slide") + " " + (i + 1));
            });
        }

        function makeDot(i) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", t("a11y.slide") + " " + (i + 1));
            dot.addEventListener("click", function () {
                index = i;
                update();
            });
            return dot;
        }

        function update() {
            var track = $("#reviewsTrack");
            if (!track) return;

            var card = $(".review", track);
            if (!card) return;

            // Read the gap from CSS rather than duplicating the number here
            var gap = parseFloat(getComputedStyle(track).columnGap);
            if (!isFinite(gap)) gap = 22;

            var step = card.getBoundingClientRect().width + gap;
            index = Math.max(0, Math.min(index, pages() - 1));
            track.style.transform = "translateX(" + (-index * step) + "px)";

            var prev = $("#revPrev");
            var next = $("#revNext");
            if (prev) prev.disabled = (index === 0);
            if (next) next.disabled = (index >= pages() - 1);

            renderDots();
        }

        function go(delta) {
            index = Math.max(0, Math.min(pages() - 1, index + delta));
            update();
        }

        return {
            init: function () {
                var prev = $("#revPrev");
                var next = $("#revNext");
                if (prev) prev.addEventListener("click", function () { go(-1); });
                if (next) next.addEventListener("click", function () { go(1); });

                var track = $("#reviewsTrack");
                if (!track) return;

                var startX = 0;
                var active = false;

                track.addEventListener("touchstart", function (e) {
                    startX = e.touches[0].clientX;
                    active = true;
                }, { passive: true });

                track.addEventListener("touchend", function (e) {
                    if (!active) return;
                    active = false;

                    var dx = e.changedTouches[0].clientX - startX;
                    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
                });
            },
            reset: function () { index = 0; update(); },
            update: update
        };
    })();

    /* ============ 8. Lightbox ============ */

    var lbIndex = 0;

    function paintLightbox() {
        var item = GALLERY[lbIndex];
        var d = loc(item);
        var img = $("#lbImage");
        var cap = $("#lbCaption");

        if (img) {
            img.onerror = function () {
                img.onerror = null;
                img.src = "images/placeholder.svg";
            };
            img.src = item.src;
            img.alt = d.t;
        }

        if (cap) cap.textContent = d.t + " · " + d.s;
    }

    function openLightbox(index) {
        var box = $("#lightbox");
        if (!box || !box.hidden) return;

        lbIndex = index;
        paintLightbox();

        box.hidden = false;
        void box.offsetWidth;
        box.classList.add("is-open");
        lockScroll(true);
        trapFocus(box);
        pushLayerState("lightbox");
    }

    function closeLightbox() {
        var box = $("#lightbox");
        if (!box || box.hidden) return;

        box.classList.remove("is-open");
        releaseFocus(box);
        lockScroll(false);
        popLayerState();

        setTimeout(function () { box.hidden = true; }, 400);
    }

    function stepLightbox(delta) {
        lbIndex = (lbIndex + delta + GALLERY.length) % GALLERY.length;
        paintLightbox();
    }

    /* Route to whichever booking form this page has */
    function bookVia(setter) {
        if ($("#booking")) {
            setter("bk");
            goTo("#booking");
            return;
        }

        setter("mb");
        openModal("booking");
    }

    function bookService(id) {
        bookVia(function (prefix) {
            var select = $("#" + prefix + "Service");
            if (select) select.value = id;
        });
    }

    function bookBarber(id) {
        bookVia(function (prefix) {
            var select = $("#" + prefix + "Barber");
            if (select) select.value = id;
        });
    }

    /* ============ 8b. Modals ============
       Generic popup: backdrop, Escape, click-outside and focus trapping, all
       reusing the same plumbing as the cart drawer. */

    var openModalId = null;

    function openModal(name) {
        var modal = $("#modal" + name.charAt(0).toUpperCase() + name.slice(1));
        var backdrop = $("#modalBackdrop");
        if (!modal || modal === $("#" + openModalId)) return;

        if (openModalId) closeModal();

        if (backdrop) {
            backdrop.hidden = false;
            void backdrop.offsetWidth;
            backdrop.classList.add("is-open");
        }

        modal.hidden = false;
        void modal.offsetWidth;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        openModalId = modal.id;
        lockScroll(true);
        trapFocus(modal);
        pushLayerState("modal:" + modal.id);
    }

    function closeModal() {
        if (!openModalId) return;

        var modal = $("#" + openModalId);
        var backdrop = $("#modalBackdrop");
        openModalId = null;

        if (!modal) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        if (backdrop) backdrop.classList.remove("is-open");

        releaseFocus(modal);
        lockScroll(false);
        popLayerState();

        setTimeout(function () {
            modal.hidden = true;
            if (backdrop && !backdrop.classList.contains("is-open")) backdrop.hidden = true;
        }, 400);
    }

    /* ---- Browser history -----------------------------------------------
       Opening a drawer or a popup pushes a history entry, so the phone's
       Back gesture dismisses that layer instead of leaving the site. The
       flag stops the popstate handler from pushing another entry while it
       is closing things down. */
    var historyDepth = 0;
    var closingFromHistory = false;

    function pushLayerState(name) {
        if (closingFromHistory) return;
        historyDepth += 1;
        try {
            history.pushState({ monarchLayer: name, depth: historyDepth }, "");
        } catch (e) {
            historyDepth -= 1;   // private mode or a file:// origin
        }
    }

    function popLayerState() {
        if (closingFromHistory || historyDepth <= 0) return;
        historyDepth -= 1;
        try { history.back(); } catch (e) {}
    }

    function initHistory() {
        window.addEventListener("popstate", function () {
            closingFromHistory = true;
            historyDepth = Math.max(0, historyDepth - 1);

            // Dismiss the topmost layer, innermost first
            var lightbox = $("#lightbox");
            if (lightbox && !lightbox.hidden) closeLightbox();
            else if (openModalId) closeModal();
            else if ($("#cartDrawer") && $("#cartDrawer").classList.contains("is-open")) closeCart();
            else closeNav();

            closingFromHistory = false;
        });
    }

    function initModals() {
        $$("[data-modal]").forEach(function (trigger) {
            trigger.addEventListener("click", function (e) {
                e.preventDefault();
                openModal(trigger.getAttribute("data-modal"));
            });
        });

        $$("[data-modal-close]").forEach(function (btn) {
            btn.addEventListener("click", closeModal);
        });

        var backdrop = $("#modalBackdrop");
        if (backdrop) backdrop.addEventListener("click", closeModal);

        // Clicking the dim area beside the panel dismisses it too
        $$(".modal").forEach(function (modal) {
            modal.addEventListener("click", function (e) {
                if (e.target === modal) closeModal();
            });
        });
    }

    /* ============ 9. Booking form ============ */

    /* The same booking form exists on the page and inside the popup, so every
       routine below works from this list rather than hard-coded ids. */
    var BOOKING_FORMS = [
        { form: "#bookingForm", prefix: "bk", success: "#bookingSuccess" },
        { form: "#modalBookingForm", prefix: "mb", success: "#modalBookingSuccess" }
    ];

    function bookingParts(cfg) {
        var form = $(cfg.form);
        if (!form) return null;

        var p = "#" + cfg.prefix;
        return {
            form: form,
            name: $(p + "Name"),
            phone: $(p + "Phone"),
            service: $(p + "Service"),
            barber: $(p + "Barber"),
            date: $(p + "Date"),
            time: $(p + "Time"),
            success: $(cfg.success)
        };
    }

    function eachBookingForm(fn) {
        BOOKING_FORMS.forEach(function (cfg) {
            var parts = bookingParts(cfg);
            if (parts) fn(parts);
        });
    }

    function fillBookingSelects() {
        eachBookingForm(fillOneBookingForm);
    }

    function fillOneBookingForm(el) {
        var service = el.service;
        var barber = el.barber;
        var time = el.time;

        if (service) {
            var keepService = service.value;
            service.innerHTML = '<option value="" disabled selected>' + esc(t("booking.choose")) + '</option>' +
                SERVICES.map(function (s) {
                    return '<option value="' + s.id + '">' + esc(loc(s).name) + " — " + money(s.price) + '</option>';
                }).join("");
            if (keepService) service.value = keepService;
        }

        if (barber) {
            var keepBarber = barber.value;
            barber.innerHTML = '<option value="any">' + esc(t("booking.any")) + '</option>' +
                BARBERS.map(function (b) {
                    return '<option value="' + b.id + '">' + esc(loc(b).name) + '</option>';
                }).join("");
            if (keepBarber) barber.value = keepBarber;
        }

        if (!time) return;

        if (!time.options.length) {
            var slots = '<option value="" disabled selected>' + esc(t("booking.chooseTime")) + '</option>';
            for (var h = 9; h <= 20; h++) {
                for (var m = 0; m < 60; m += 30) {
                    var label = ("0" + h).slice(-2) + ":" + ("0" + m).slice(-2);
                    slots += '<option value="' + label + '">' + label + '</option>';
                }
            }
            time.innerHTML = slots;
        } else if (time.options[0] && !time.options[0].value) {
            time.options[0].textContent = t("booking.chooseTime");
        }
    }

    function fieldError(input, messageKey) {
        var field = input.closest(".field");
        if (!field) return;

        field.classList.add("has-error");
        input.setAttribute("aria-invalid", "true");

        var slot = $(".error", field);
        if (slot) slot.textContent = t(messageKey);
    }

    function clearError(input) {
        var field = input.closest(".field");
        if (!field) return;

        field.classList.remove("has-error");
        input.removeAttribute("aria-invalid");

        var slot = $(".error", field);
        if (slot) slot.textContent = "";
    }

    function todayISO() {
        var now = new Date();
        return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }

    function initBooking() {
        eachBookingForm(function (el) {
            if (el.date) {
                el.date.min = todayISO();
                if (!el.date.value) el.date.value = el.date.min;
            }

            $$("input, select, textarea", el.form).forEach(function (field) {
                field.addEventListener("input", function () { clearError(field); });
                field.addEventListener("change", function () { clearError(field); });
            });

            el.form.addEventListener("submit", function (e) {
                e.preventDefault();
                submitBooking(el);
            });
        });
    }

    function submitBooking(el) {
        var ok = true;

        if (el.name.value.trim().length < 2) {
            fieldError(el.name, "err.name");
            ok = false;
        }

        if (!isValidNationalNumber(phoneCountryFor(el.phone.id), el.phone.value)) {
            fieldError(el.phone, "err.phoneIntl");
            ok = false;
        }

        if (!el.service.value) { fieldError(el.service, "err.required"); ok = false; }
        if (!el.time.value) { fieldError(el.time, "err.required"); ok = false; }

        if (!el.date.value) {
            fieldError(el.date, "err.required");
            ok = false;
        } else if (el.date.min && el.date.value < el.date.min) {
            fieldError(el.date, "err.date");
            ok = false;
        }

        if (!ok) {
            var firstBad = $(".field.has-error input, .field.has-error select", el.form);
            if (firstBad) firstBad.focus();
            return;
        }

        if (el.success) {
            el.success.textContent = t("booking.success");
            el.success.hidden = false;
        }

        toast(t("booking.success"));

        el.form.reset();
        if (el.date) el.date.value = el.date.min;
        fillOneBookingForm(el);

        setTimeout(function () {
            if (el.success) el.success.hidden = true;
        }, 7000);
    }

    /* ============ 10. Navigation & scroll UX ============ */

    function headerHeight() {
        return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) || 90;
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function goTo(hash) {
        var target = $(hash);
        if (!target) return;

        closeNav();

        var top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight();
        window.scrollTo({ top: top, behavior: prefersReducedMotion() ? "auto" : "smooth" });

        // Move the caret with the viewport, or keyboard users stay at the top
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
    }

    function navIsOpen() {
        var nav = $("#nav");
        return !!nav && nav.classList.contains("is-open");
    }

    /* On phones these sections are replaced by standalone pages, so a nav item
       pointing at a hidden section has to navigate instead of scrolling. */
    var SECTION_PAGES = {
        "#about": "about.html",
        "#services": "services.html",
        "#barbers": "barbers.html",
        "#shop": "shop.html",
        "#reviews": "reviews.html"
    };

    /* These live on their own page at every width — never scroll to them.
       #reviews stays out: on the home page it is a slider worth scrolling to. */
    var ALWAYS_PAGE = { "#shop": true, "#barbers": true, "#services": true, "#about": true };

    function navigateTo(hash) {
        var target = $(hash);

        if (SECTION_PAGES[hash] && (ALWAYS_PAGE[hash] || !target || target.offsetParent === null)) {
            window.location.href = SECTION_PAGES[hash];
            return;
        }

        goTo(hash);
    }

    function closeNav() {
        var nav = $("#nav");
        var burger = $("#burger");
        if (!navIsOpen()) return;

        nav.classList.remove("is-open");

        if (burger) {
            burger.classList.remove("is-open");
            burger.setAttribute("aria-expanded", "false");
        }

        releaseFocus(nav);
        lockScroll(false);
    }

    function openNav() {
        var nav = $("#nav");
        var burger = $("#burger");
        if (!nav || navIsOpen()) return;

        nav.classList.add("is-open");

        if (burger) {
            burger.classList.add("is-open");
            burger.setAttribute("aria-expanded", "true");
        }

        lockScroll(true);
        trapFocus(nav);
    }

    function initNav() {
        var burger = $("#burger");
        var nav = $("#nav");

        if (burger && nav) {
            burger.addEventListener("click", function () {
                if (navIsOpen()) closeNav();
                else openNav();
            });
        }

        $$('a[href^="#"]').forEach(function (link) {
            var hash = link.getAttribute("href");
            if (hash.length < 2 || !$(hash)) return;

            link.addEventListener("click", function (e) {
                e.preventDefault();
                navigateTo(hash);
            });
        });

        // Tapping outside the mobile drawer closes it
        document.addEventListener("click", function (e) {
            if (!nav || !nav.classList.contains("is-open")) return;
            if (nav.contains(e.target) || (burger && burger.contains(e.target))) return;
            closeNav();
        });
    }

    var sections = [];

    function cacheSections() {
        // A display:none section reports offsetTop 0 and would hijack the spy
        sections = $$("section[id]").filter(function (el) {
            return el.offsetParent !== null;
        });
    }

    function onScroll() {
        var y = window.pageYOffset;
        var header = $("#header");
        var toTop = $("#toTop");
        var progress = $("#scrollProgress");

        if (header) header.classList.toggle("is-stuck", y > 40);
        if (toTop) toTop.classList.toggle("is-visible", y > 600);

        /* The phone action bar appears once the hero (which carries its own
           CTAs) has scrolled away, and retreats over the booking form so it
           never covers the very thing it points at. */
        var cta = $("#mobileCta");
        if (cta) {
            var hero = $(".hero");
            var booking = $("#booking");
            var past = hero ? y > hero.offsetHeight * 0.75 : y > 500;
            var atBooking = booking &&
                y + window.innerHeight > booking.offsetTop + 120 &&
                y < booking.offsetTop + booking.offsetHeight;
            cta.classList.toggle("is-visible", past && !atBooking);
        }

        if (progress) {
            var scrollable = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (scrollable > 0 ? (y / scrollable) * 100 : 0) + "%";
        }

        var offset = y + window.innerHeight * 0.32;
        var current = "";

        for (var i = 0; i < sections.length; i++) {
            if (sections[i].offsetTop <= offset) current = sections[i].id;
        }

        $$(".nav-link").forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === "#" + current);
        });
    }

    function initScroll() {
        var ticking = false;

        window.addEventListener("scroll", function () {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(function () {
                onScroll();
                ticking = false;
            });
        }, { passive: true });

        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                cacheSections();
                slider.update();
                onScroll();
            }, 160);
        });

        var toTop = $("#toTop");
        if (toTop) {
            toTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
                var logo = $(".logo");
                if (logo) logo.focus({ preventScroll: true });
            });
        }
    }

    /* Scroll reveal */
    var revealObserver = null;

    function revealAll() {
        var items = $$(".reveal:not(.is-visible)");

        if (!("IntersectionObserver" in window)) {
            items.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }

        if (!revealObserver) {
            revealObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
        }

        items.forEach(function (el) { revealObserver.observe(el); });
    }

    /* Failsafe: content must never stay stuck at opacity 0. If the observer
       has not delivered (a page opened in a background tab never fires it),
       show everything that is already within reach of the viewport. */
    function revealFailsafe() {
        $$(".reveal:not(.is-visible)").forEach(function (el) {
            if (el.getBoundingClientRect().top < window.innerHeight * 1.15) {
                el.classList.add("is-visible");
            }
        });
    }

    /* ---- Statistics ---- */

    function compactCount(n) {
        if (n >= 1000) return Math.floor(n / 1000) + "k+";
        return String(n);
    }

    function formatRating(n) {
        return Number(n).toLocaleString(lang === "ua" ? "uk-UA" : "en-US",
            { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }

    /* Years of service are derived, never typed in */
    function yearsOfService() {
        return Math.max(1, new Date().getFullYear() - STATS.foundedYear);
    }

    function applyStats() {
        var years = $("#statYears");
        var clients = $("#statClients");
        var rating = $("#statRating");

        if (years) years.textContent = yearsOfService();
        if (clients) clients.textContent = compactCount(STATS.clients);
        if (rating) rating.textContent = formatRating(STATS.rating);

        /* The hero eyebrow quotes the founding year and the stat beside it
           counts the years since. Typed separately they drift the moment
           STATS.foundedYear changes, so the eyebrow reads from it too. */
        var eyebrow = $('[data-i18n="hero.eyebrow"]');
        if (eyebrow) eyebrow.textContent = t("hero.eyebrow").replace("{year}", STATS.foundedYear);

        // The reviews strapline quotes the same two numbers
        var sub = $('[data-i18n="reviews.sub"]');
        if (sub) {
            sub.textContent = t("reviews.sub")
                .replace("{count}", STATS.reviews.toLocaleString(lang === "ua" ? "uk-UA" : "en-US"))
                .replace("{rating}", formatRating(STATS.rating));
        }
    }

    function loadStats() {
        applyStats();   // paint the fallback straight away

        if (!window.fetch) return;

        fetch(STATS_SOURCE, { cache: "no-store" })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data || typeof data !== "object") return;

                ["foundedYear", "clients", "rating", "reviews"].forEach(function (key) {
                    var value = Number(data[key]);
                    if (isFinite(value) && value > 0) STATS[key] = value;
                });

                applyStats();
            })
            .catch(function () {
                /* No server (file://) or no file — the fallback already shows. */
            });
    }

    /* Live opening-hours indicator */
    function updateOpenState() {
        var el = $("#openState");
        if (!el) return;

        var now = new Date();
        var day = now.getDay(); // 0 = Sunday
        var minutes = now.getHours() * 60 + now.getMinutes();

        var window_ = (day === 0) ? [11 * 60, 18 * 60]
            : (day === 6) ? [10 * 60, 20 * 60]
            : [9 * 60, 21 * 60];

        var open = (minutes >= window_[0] && minutes < window_[1]);

        el.classList.toggle("is-open", open);
        el.textContent = t(open ? "contacts.open" : "contacts.closed");
    }

    /* The shop opens and closes while someone has the page open. */
    function startOpenStateClock() {
        setInterval(updateOpenState, 60000);
    }

    /* ============ 11. Boot ============ */

    function initPreloader() {
        var pre = $("#preloader");
        if (!pre) return;

        var start = Date.now();
        var closed = false;

        var done = function () {
            if (closed) return;
            closed = true;

            pre.classList.add("is-done");
            setTimeout(function () {
                if (pre.parentNode) pre.parentNode.removeChild(pre);
            }, 900);
        };

        var finish = function () {
            setTimeout(done, Math.max(0, 1500 - (Date.now() - start)));
        };

        if (document.readyState === "complete") finish();
        else window.addEventListener("load", finish);

        // A slow external image must never hold the curtain shut.
        setTimeout(done, 4500);
    }

    function initGlobalKeys() {
        document.addEventListener("keydown", function (e) {
            var lightbox = $("#lightbox");

            if (e.key === "Escape") {
                // Dismiss only the topmost layer, innermost first
                if (lightbox && !lightbox.hidden) closeLightbox();
                else if (openModalId) closeModal();
                else if ($("#cartDrawer").classList.contains("is-open")) closeCart();
                else closeNav();
                return;
            }

            if (lightbox && !lightbox.hidden) {
                if (e.key === "ArrowLeft") stepLightbox(-1);
                if (e.key === "ArrowRight") stepLightbox(1);
            }
        });
    }

    /* ---- Page-hero tool art -------------------------------------------
       Feeds --px / --py (both -1..1) to the CSS, which does the actual
       transforms. Two input sources, because they answer different
       questions: a mouse asks "where is the cursor", a phone has no cursor
       at all and asks "how far have I scrolled".

       Nothing here reads layout inside the event itself — the hero's box is
       measured once and re-measured on resize, so moving the pointer never
       forces a synchronous reflow. */
    function initHeroArt() {
        var hero = document.querySelector(".page-hero");
        var art = hero && hero.querySelector(".hero-art");
        if (!art) return;

        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        var box = null;
        var frame = 0;
        var wantX = 0;
        var wantY = 0;

        function measure() {
            box = hero.getBoundingClientRect();
        }

        function apply(px, py) {
            /* Keep the newest position and paint it once per frame. Dropping
               the events that arrive mid-frame instead would leave the art
               chasing wherever the pointer happened to be when the frame was
               booked, not where it actually is. */
            wantX = px;
            wantY = py;
            if (frame) return;
            frame = 1;
            requestAnimationFrame(function () {
                frame = 0;
                if (reduced.matches) {
                    art.style.removeProperty("--px");
                    art.style.removeProperty("--py");
                    return;
                }
                art.style.setProperty("--px", wantX.toFixed(3));
                art.style.setProperty("--py", wantY.toFixed(3));
            });
        }

        function clamp(n) {
            return n < -1 ? -1 : n > 1 ? 1 : n;
        }

        function onPointer(e) {
            /* Read live rather than at wire-up time: a tablet paired with a
               mouse, or a laptop with both, can flip this after load. */
            if (!fine.matches) return;
            if (!box) measure();
            apply(clamp((e.clientX - box.left) / box.width * 2 - 1),
                  clamp((e.clientY - box.top) / box.height * 2 - 1));
        }

        function onLeave() {
            apply(0, 0);
        }

        /* Touch fallback: the hero drifts as it leaves the top of the screen.
           Only --py moves, so the tilt stays on one axis and reads as the
           blade settling rather than swinging. */
        function onScrollArt() {
            if (fine.matches) return;
            if (!box) measure();
            var travelled = window.pageYOffset / Math.max(1, box.height);
            apply(0, clamp(travelled * 1.6 - .35));
        }

        measure();
        window.addEventListener("resize", measure);
        /* Fonts and the art itself land after this runs and change the hero's
           height; without this the mapping stays keyed to a stale box. */
        window.addEventListener("load", measure);

        /* Both are wired unconditionally and each bows out on its own when the
           other owns the interaction — a touch drag does emit pointermove, but
           onPointer ignores it while the pointer is coarse. */
        hero.addEventListener("pointermove", onPointer);
        hero.addEventListener("pointerleave", onLeave);
        window.addEventListener("scroll", onScrollArt, { passive: true });
        onScrollArt();
    }

    function init() {
        var yearEl = $("#year");
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        // Cart
        var cartOpen = $("#cartOpen");
        var cartClose = $("#cartClose");
        var backdrop = $("#cartBackdrop");

        if (cartOpen) cartOpen.addEventListener("click", openCart);
        if (cartClose) cartClose.addEventListener("click", closeCart);
        if (backdrop) backdrop.addEventListener("click", closeCart);

        initCheckout();

        // Lightbox
        var lbClose = $("#lbClose");
        var lbPrev = $("#lbPrev");
        var lbNext = $("#lbNext");
        var lightbox = $("#lightbox");

        if (lbClose) lbClose.addEventListener("click", closeLightbox);
        if (lbPrev) lbPrev.addEventListener("click", function () { stepLightbox(-1); });
        if (lbNext) lbNext.addEventListener("click", function () { stepLightbox(1); });
        if (lightbox) {
            lightbox.addEventListener("click", function (e) {
                if (e.target === lightbox) closeLightbox();
            });
        }

        /* Social icons are placeholders: they announce themselves rather than
           navigating anywhere. Kept as <a> for styling, so they need an
           explicit key handler to behave like the buttons they now are. */
        $$(".social-link").forEach(function (link) {
            wireInert(link, "social.msg");
        });

        /* Phone and email are demo values: inert, but they say so when tapped
           rather than looking like a link that is simply broken. */
        $$(".demo-contact").forEach(function (link) {
            wireInert(link, "contact.demo");
        });

        // Language
        $$(".language button").forEach(function (btn) {
            btn.addEventListener("click", function () {
                setLanguage(btn.getAttribute("data-lang"));
            });
        });

        slider.init();
        initHistory();
        initModals();
        initNav();
        initScroll();
        initBooking();
        initGlobalKeys();

        setLanguage(store("monarch_lang") || "ua");

        /* After setLanguage, not before: the hero headings are empty in the
           markup and i18n fills them, so measuring first caches a box that is
           short by a line or two and skews the pointer mapping. */
        initHeroArt();

        cacheSections();
        onScroll();
        startOpenStateClock();
        loadStats();

        setTimeout(revealFailsafe, 2600);

        // A tab opened in the background resumes here.
        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState !== "visible") return;
            cacheSections();
            slider.update();
            onScroll();
            revealAll();
        });

        // Recalculate once fonts and images have settled.
        window.addEventListener("load", function () {
            cacheSections();
            slider.update();
            onScroll();
        });
    }

    /* The preloader covers the page and .reveal content starts transparent, so
       any unexpected failure during boot must still uncover the site rather
       than leave the visitor staring at a blank screen. */
    /* A reload should present the page from the top, not wherever the visitor
       happened to be last time. Turning off the browser's own restoration is
       the half that survives the preloader; the explicit scroll covers the
       restore some browsers perform before that setting takes effect.
       An address that names a section (index.html#gallery) is a deliberate
       destination, so it is left alone. */
    function resetScrollOnLoad() {
        if ("scrollRestoration" in history) {
            try { history.scrollRestoration = "manual"; } catch (e) {}
        }

        if (location.hash && $(location.hash)) return;

        window.scrollTo(0, 0);
        window.addEventListener("load", function () { window.scrollTo(0, 0); });
    }

    function boot() {
        resetScrollOnLoad();
        initPreloader();

        try {
            init();
        } catch (err) {
            if (window.console && console.error) console.error("MONARCH init failed:", err);

            $$(".reveal").forEach(function (el) { el.classList.add("is-visible"); });

            var pre = $("#preloader");
            if (pre && pre.parentNode) pre.parentNode.removeChild(pre);

            document.body.classList.remove("is-locked");
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
