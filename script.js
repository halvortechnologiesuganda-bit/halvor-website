/**
 * Halvor Technologies - Main Script
 * Mobile navigation, page animations, contact form and gallery.
 */

(function () {
    "use strict";

    /* =========================================================
       MOBILE NAVIGATION
       ========================================================= */

    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    const navOverlay = document.getElementById("navOverlay");

    if (hamburger && navLinks) {
        const setMenuState = (open) => {
            navLinks.classList.toggle("active", open);
            hamburger.classList.toggle("active", open);

            if (navOverlay) {
                navOverlay.classList.toggle("active", open);
                navOverlay.setAttribute("aria-hidden", String(!open));
            }

            hamburger.setAttribute("aria-expanded", String(open));
            hamburger.setAttribute(
                "aria-label",
                open ? "Close navigation menu" : "Open navigation menu"
            );

            document.body.classList.toggle("menu-open", open);
            document.body.style.overflow = open ? "hidden" : "";
        };

        hamburger.addEventListener("click", () => {
            setMenuState(!navLinks.classList.contains("active"));
        });

        if (navOverlay) {
            navOverlay.addEventListener("click", () => setMenuState(false));
        }

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => setMenuState(false));
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && navLinks.classList.contains("active")) {
                setMenuState(false);
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 768 && navLinks.classList.contains("active")) {
                setMenuState(false);
            }
        });
    }

    /* =========================================================
       SCROLL ANIMATIONS
       ========================================================= */

    const animatedSelectors = [
        ".animate-on-scroll",
        ".animate-scale",
        ".animate-from-left",
        ".animate-from-right",
        ".section-title"
    ].join(",");

    const elements = document.querySelectorAll(animatedSelectors);

    if (elements.length) {
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (reducedMotion || !("IntersectionObserver" in window)) {
            elements.forEach((element) => element.classList.add("is-visible"));
        } else {
            const observer = new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            obs.unobserve(entry.target);
                        }
                    });
                },
                {
                    root: null,
                    rootMargin: "0px 0px -8% 0px",
                    threshold: 0.12
                }
            );

            elements.forEach((element) => observer.observe(element));
        }
    }

    /* =========================================================
       CONTACT FORM - ONLY RUNS WHEN FORM EXISTS
       ========================================================= */

    const form = document.getElementById("contactForm");

    if (form) {
        const formFields = document.getElementById("formFields");
        const formSuccess = document.getElementById("formSuccess");
        const formError = document.getElementById("formError");
        const submitBtn = document.getElementById("submitBtn");
        const sendAnotherBtn = document.getElementById("sendAnother");

        const validateField = (field) => {
            const group = field.closest(".form-group");
            if (!group) return true;

            const errorEl = group.querySelector(".error-message");
            let message = "";

            if (field.validity.valueMissing) {
                message = "This field is required";
            } else if (
                field.type === "email" &&
                field.validity.typeMismatch
            ) {
                message = "Please enter a valid email address";
            }

            group.classList.toggle("error", Boolean(message));

            if (errorEl) {
                errorEl.textContent = message;
            }

            return !message;
        };

        form.querySelectorAll("input, select, textarea").forEach((field) => {
            field.addEventListener("blur", () => validateField(field));

            field.addEventListener("input", () => {
                const group = field.closest(".form-group");
                if (group && group.classList.contains("error")) {
                    validateField(field);
                }
            });
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            let isValid = true;

            form.querySelectorAll("[required]").forEach((field) => {
                if (!validateField(field)) isValid = false;
            });

            if (!isValid) return;

            if (submitBtn) {
                submitBtn.classList.add("is-loading");
                submitBtn.disabled = true;
            }

            if (formError) formError.hidden = true;

            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    headers: { Accept: "application/json" }
                });

                if (response.ok) {
                    if (formFields) formFields.hidden = true;
                    if (formSuccess) formSuccess.hidden = false;
                    form.reset();
                } else {
                    if (formError) formError.hidden = false;
                }
            } catch (error) {
                if (formError) formError.hidden = false;
            } finally {
                if (submitBtn) {
                    submitBtn.classList.remove("is-loading");
                    submitBtn.disabled = false;
                }
            }
        });

        if (sendAnotherBtn) {
            sendAnotherBtn.addEventListener("click", () => {
                if (formFields) formFields.hidden = false;
                if (formSuccess) formSuccess.hidden = true;
                if (formError) formError.hidden = true;

                form.querySelectorAll(".form-group.error").forEach((group) => {
                    group.classList.remove("error");
                });
            });
        }
    }

    /* =========================================================
       GALLERY FILTER + LIGHTBOX
       ========================================================= */

    const filterButtons = Array.from(
        document.querySelectorAll(".filter-btn")
    );
    const galleryItems = Array.from(
        document.querySelectorAll(".gallery-item")
    );

    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const closeBtn = document.getElementById("closeBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (filterButtons.length && galleryItems.length) {
        let visibleItems = [...galleryItems];
        let currentIndex = 0;

        const getVisibleItems = () =>
            galleryItems.filter((item) => !item.classList.contains("hidden"));

        const updateLightbox = () => {
            if (!lightboxImage || !visibleItems.length) return;

            const item = visibleItems[currentIndex];
            const image = item.querySelector("img");

            if (!image) return;

            lightboxImage.src = image.currentSrc || image.src;
            lightboxImage.alt = image.alt || "";

            if (lightboxCaption) {
                lightboxCaption.textContent =
                    item.dataset.title || item.dataset.category || image.alt || "";
            }
        };

        const openLightbox = (index) => {
            if (!lightbox || !visibleItems.length) return;

            currentIndex = (index + visibleItems.length) % visibleItems.length;
            updateLightbox();

            lightbox.classList.add("show");
            lightbox.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        };

        const closeLightbox = () => {
            if (!lightbox) return;

            lightbox.classList.remove("show");
            lightbox.setAttribute("aria-hidden", "true");

            if (!navLinks || !navLinks.classList.contains("active")) {
                document.body.style.overflow = "";
            }
        };

        const showNext = () => {
            if (!visibleItems.length) return;
            currentIndex = (currentIndex + 1) % visibleItems.length;
            updateLightbox();
        };

        const showPrevious = () => {
            if (!visibleItems.length) return;
            currentIndex =
                (currentIndex - 1 + visibleItems.length) %
                visibleItems.length;
            updateLightbox();
        };

        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                filterButtons.forEach((btn) =>
                    btn.classList.remove("active")
                );
                button.classList.add("active");

                const filter = button.dataset.filter || "all";

                galleryItems.forEach((item) => {
                    const show =
                        filter === "all" ||
                        item.classList.contains(filter);

                    item.classList.toggle("hidden", !show);
                });

                visibleItems = getVisibleItems();
                currentIndex = 0;
            });
        });

        galleryItems.forEach((item) => {
            const openFromItem = () => {
                visibleItems = getVisibleItems();

                const index = visibleItems.indexOf(item);
                openLightbox(index >= 0 ? index : 0);
            };

            item.addEventListener("click", openFromItem);

            item.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openFromItem();
                }
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                closeLightbox();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                showNext();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                showPrevious();
            });
        }

        if (lightbox) {
            lightbox.addEventListener("click", (event) => {
                if (event.target === lightbox) {
                    closeLightbox();
                }
            });
        }

        document.addEventListener("keydown", (event) => {
            if (!lightbox || !lightbox.classList.contains("show")) return;

            if (event.key === "Escape") closeLightbox();
            if (event.key === "ArrowRight") showNext();
            if (event.key === "ArrowLeft") showPrevious();
        });

        /* Basic touch swipe support */
        let touchStartX = 0;

        if (lightbox) {
            lightbox.addEventListener(
                "touchstart",
                (event) => {
                    touchStartX = event.changedTouches[0].screenX;
                },
                { passive: true }
            );

            lightbox.addEventListener(
                "touchend",
                (event) => {
                    const touchEndX = event.changedTouches[0].screenX;
                    const distance = touchEndX - touchStartX;

                    if (Math.abs(distance) < 50) return;

                    if (distance < 0) {
                        showNext();
                    } else {
                        showPrevious();
                    }
                },
                { passive: true }
            );
        }
    }
})();
/* =========================================
   HALVOR TECHNOLOGIES - DIGITAL CODE EFFECT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("codeRain");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const hero = canvas.parentElement;

    const codeSnippets = [
        "const innovate = true;",
        "function create() {}",
        "HTML / CSS / JS",
        "0101011010",
        "console.log('Halvor');",
        "Web Development",
        "Digital Solutions",
        "Network.connect();",
        "AI.initialize()",
        "let future = 'bright';",
        "return innovation;",
        "01001001 01010100",
        "Photography();",
        "Design.create()",
        "Technology.advance()",
        "while(true) { innovate(); }",
        "class HalvorTech {}",
        "const future = build();"
    ];

    let streams = [];
    let width = 0;
    let height = 0;
    let animationFrame;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    function resizeCanvas() {

        const rect = hero.getBoundingClientRect();

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        width = rect.width;
        height = rect.height;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const streamCount = width < 600 ? 9 : 20;

        streams = Array.from(
            { length: streamCount },
            (_, i) => ({
                x: (width / streamCount) * i + Math.random() * 30,
                y: Math.random() * height,
                speed: 0.35 + Math.random() * 0.8,
                text: codeSnippets[
                    Math.floor(Math.random() * codeSnippets.length)
                ],
                opacity: 0.25 + Math.random() * 0.55,
                fontSize: 10 + Math.random() * 4
            })
        );

        if (reducedMotion) draw();
    }

    function draw() {

        ctx.clearRect(0, 0, width, height);

        streams.forEach(stream => {

            ctx.font = `${stream.fontSize}px monospace`;

            ctx.fillStyle = `rgba(0, 210, 255, ${stream.opacity})`;

            ctx.shadowColor = "#00cfff";
            ctx.shadowBlur = 8;

            ctx.fillText(
                stream.text,
                stream.x,
                stream.y
            );

            if (!reducedMotion) {

                stream.y += stream.speed;

                if (stream.y > height + 50) {

                    stream.y = -30;

                    stream.text = codeSnippets[
                        Math.floor(Math.random() * codeSnippets.length)
                    ];

                    stream.speed = 0.35 + Math.random() * 0.8;
                }
            }
        });

        ctx.shadowBlur = 0;

        if (!reducedMotion) {
            animationFrame = requestAnimationFrame(draw);
        }
    }

    resizeCanvas();
    draw();

    let resizeTimeout;

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            cancelAnimationFrame(animationFrame);
            resizeCanvas();

            if (!reducedMotion) draw();
        }, 150);
    });

});