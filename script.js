const state = {
    lang: localStorage.getItem('mod-language') || 'cs'
};


// Najde hodnotu v JSONu podle cesty, např. "services.title"
const get = (object, path) => {
    return path.split('.').reduce((value, key) => value?.[key], object);
};


// Načte správný jazykový JSON
async function load(lang) {
    const response = await fetch(`content/${lang}.json`);

    if (!response.ok) {
        throw Error('Obsah nelze načíst');
    }

    return response.json();
}


// Vykreslí obsah stránky
function render(content) {

    document.documentElement.lang = state.lang;

    document.title = `${content.site.name} — ${content.site.tagline}`;


    // Texty označené data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {

        const value = get(content, element.dataset.i18n);

        if (value !== undefined) {
            element.textContent = value;
        }

    });


    // Texty, které mohou obsahovat HTML
    document.querySelectorAll('[data-i18n-html]').forEach(element => {

        const value = get(content, element.dataset.i18nHtml);

        if (value !== undefined) {
            element.innerHTML = value;
        }

    });


    // Služby
    document.querySelector('#service-grid').innerHTML =
        content.services.items.map((item, index) => {

            return `
                <article class="service-card">

                    <span>
                        ${String(index + 1).padStart(2, '0')}
                    </span>

                    <h3>
                        ${item.title}
                    </h3>

                    <p>
                        ${item.description}
                    </p>

                </article>
            `;

        }).join('');


    // O nás
    document.querySelector('#about-paragraphs').innerHTML =
        content.about.paragraphs.map(text => {

            return `<p>${text}</p>`;

        }).join('');


    // Fotografie / reference
    const classes = [
        'photo-one',
        'photo-two',
        'photo-three'
    ];

    document.querySelector('#photo-grid').innerHTML =
        content.work.items.map((item, index) => {

            return `
                <div class="photo ${classes[index] || ''}">
                    <span>${item.label}</span>
                </div>
            `;

        }).join('');


    // E-mail
    document.querySelector('#email-button').href =
        `mailto:${content.site.email}`;


    // Aktivní jazyk
    document.querySelectorAll('.lang-button').forEach(button => {

        button.classList.toggle(
            'active',
            button.dataset.lang === state.lang
        );

    });

}


// Zavře mobilní menu
function closeMenu() {

    document.body.classList.remove('hero-menu-open');

    // Znovu povolíme scrollování stránky
    document.body.style.overflow = '';

    document.querySelectorAll('.menu-toggle').forEach(button => {

        button.setAttribute(
            'aria-expanded',
            'false'
        );

    });

}


// Otevře mobilní menu
function openMenu() {

    document.body.classList.add('hero-menu-open');

    // Zamkneme scrollování stránky
    document.body.style.overflow = 'hidden';

    document.querySelectorAll('.menu-toggle').forEach(button => {

        button.setAttribute(
            'aria-expanded',
            'true'
        );

    });

}


// Hamburger v hero
document.querySelector('.hero-nav .menu-toggle').onclick = () => {

    if (document.body.classList.contains('hero-menu-open')) {

        closeMenu();

    } else {

        openMenu();

    }

};


// Hamburger v navigaci po odscrollování hero
document.querySelector('.scrolled-menu-toggle').onclick = () => {

    // NEVRACÍME stránku do hero.
    // Menu se otevře přes místo, kde právě jsme.
    if (document.body.classList.contains('hero-menu-open')) {
        closeMenu();
    } else {
        openMenu();
    }

};


// Kliknutí na položku menu menu zavře
document.querySelectorAll('.mobile-menu a').forEach(link => {

    link.onclick = closeMenu;

});


// Přepínání jazyků
document.querySelectorAll('.lang-button').forEach(button => {

    button.onclick = async () => {

        state.lang = button.dataset.lang;

        localStorage.setItem(
            'mod-language',
            state.lang
        );

        const content = await load(state.lang);

        render(content);

    };

});


// Sleduje, jestli je hero na obrazovce
const observer = new IntersectionObserver(
    ([entry]) => {

        document
            .querySelector('#scrolled-nav')
            .classList
            .toggle(
                'visible',
                !entry.isIntersecting
            );

    },
    {
        threshold: 0.08
    }
);


// Spustíme sledování hero
observer.observe(
    document.querySelector('#hero')
);


// Načteme výchozí jazyk
load(state.lang)
    .then(render)
    .catch(console.error);