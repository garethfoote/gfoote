import "./index.css"
// import { drawSquiggle } from './ts/squiggle.ts'
import { animateContours, drawContours } from './ts/contours.ts'
import { Tabs } from './ts/tabs.ts'

const canvasContainer = document.querySelector(".squiggle") as HTMLElement;
const canvas = document.getElementById("squiggle") as HTMLCanvasElement;
const LOGO_DRAW_SIZE = 80;
const LOGO_CANVAS_PADDING = 40;

window.addEventListener("load", () => {
  canvasContainer.classList.remove("squiggle--hidden");
  // drawSquiggle(canvas, 800, 600, 600);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    drawContours(canvas, LOGO_DRAW_SIZE, LOGO_DRAW_SIZE, {
      canvasPadding: LOGO_CANVAS_PADDING,
    });
    return;
  }

  animateContours(canvas, LOGO_DRAW_SIZE, LOGO_DRAW_SIZE, {
    amplitude: 0.16,
    speed: 0.0003,
    scale: 0.13,
    peakDrift: 1.6,
    peakHeightDrift: 0.08,
    peakSpeed: 0.00008,
    canvasPadding: LOGO_CANVAS_PADDING,
  });
})

const tabsEl: HTMLElement | null = document.querySelector(
  "[data-module=tabs]"
);
if(tabsEl){
  const tabs: Tabs = new Tabs(tabsEl);
  tabs.initialise();
}

const stickyHeroes = Array.from(
  document.querySelectorAll<HTMLElement>(".post-hero")
);

if (stickyHeroes.length > 0) {
  const heroOffsets = new Map<HTMLElement, number>();

  const measureStickyHeroes = () => {
    stickyHeroes.forEach((hero) => {
      hero.classList.remove("is-stuck");
      heroOffsets.set(hero, hero.getBoundingClientRect().top + window.scrollY);
    });
  };

  const updateStickyHeroes = () => {
    stickyHeroes.forEach((hero) => {
      const heroTop = heroOffsets.get(hero) ?? 0;
      hero.classList.toggle("is-stuck", window.scrollY >= heroTop);
    });
  };

  measureStickyHeroes();
  updateStickyHeroes();

  window.addEventListener("scroll", updateStickyHeroes, { passive: true });
  window.addEventListener("resize", () => {
    measureStickyHeroes();
    updateStickyHeroes();
  });
}

/*
 * If first paragraph in content contains an image we
 * assume this is a hero type image and remove the 
 * max-width constraint from the <p>
 */
const firstP = document.querySelector(".content p");
if(firstP?.firstElementChild?.tagName == "IMG"){
  firstP.classList.add("hero");
}

const photographyImages = Array.from(
  document.querySelectorAll<HTMLImageElement>(".content--photographs img")
);

if (photographyImages.length > 0) {
  const visibleImages = new Set<HTMLImageElement>();
  let pendingFocusUpdate = false;
  let activePhotograph = photographyImages[0];
  const backToTopLink = document.querySelector<HTMLAnchorElement>(".photographs-back-to-top");

  document.body.classList.add("has-photographs");

  const updatePhotographyFocusState = () => {
    const isFocused = window.scrollY > 48;
    document.body.classList.toggle("photographs-is-focused", isFocused);
    document.body.classList.toggle("photographs-is-gallery-mode", isFocused);
  };

  const setActiveImage = (activeImage: HTMLImageElement) => {
    activePhotograph = activeImage;
    photographyImages.forEach((image) => {
      image.classList.toggle("is-active", image === activeImage);
    });
  };

  const scrollToPhotograph = (image: HTMLImageElement) => {
    image.scrollIntoView({
      block: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const updateFocusedPhotograph = () => {
    pendingFocusUpdate = false;

    const viewportCentre = window.innerHeight / 2;
    const candidates = visibleImages.size > 0
      ? Array.from(visibleImages)
      : photographyImages;

    let closestImage = candidates[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    candidates.forEach((image) => {
      const rect = image.getBoundingClientRect();
      const imageCentre = rect.top + rect.height / 2;
      const distanceFromCentre = Math.abs(imageCentre - viewportCentre);

      if (distanceFromCentre < closestDistance) {
        closestDistance = distanceFromCentre;
        closestImage = image;
      }
    });

    if (closestImage) {
      setActiveImage(closestImage);
    }
  };

  const requestFocusUpdate = () => {
    if (pendingFocusUpdate) return;

    pendingFocusUpdate = true;
    window.requestAnimationFrame(updateFocusedPhotograph);
  };

  const photographObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!(entry.target instanceof HTMLImageElement)) return;

      if (entry.isIntersecting) {
        visibleImages.add(entry.target);
      } else {
        visibleImages.delete(entry.target);
      }
    });

    requestFocusUpdate();
  }, {
    rootMargin: "-20% 0px -20% 0px",
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });

  photographyImages.forEach((image) => photographObserver.observe(image));
  setActiveImage(photographyImages[0]);

  const getPreviousPhotograph = () => {
    const activeIndex = photographyImages.indexOf(activePhotograph);
    const previousIndex = activeIndex <= 0
      ? photographyImages.length - 1
      : activeIndex - 1;

    return photographyImages[previousIndex];
  };

  const getNextPhotograph = () => {
    if (window.scrollY <= 48) {
      return photographyImages[0];
    }

    const activeIndex = photographyImages.indexOf(activePhotograph);
    const nextIndex = activeIndex >= photographyImages.length - 1
      ? 0
      : activeIndex + 1;

    return photographyImages[nextIndex];
  };

  window.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement;
    const isFormField = activeElement instanceof HTMLInputElement
      || activeElement instanceof HTMLTextAreaElement
      || activeElement instanceof HTMLSelectElement
      || activeElement instanceof HTMLButtonElement
      || activeElement?.getAttribute("contenteditable") === "true";

    if (isFormField) return;

    if (
      event.key === "ArrowUp"
      || event.key === "ArrowLeft"
      || (event.key === " " && event.shiftKey)
    ) {
      event.preventDefault();
      scrollToPhotograph(getPreviousPhotograph());
      return;
    }

    if (
      event.key === "ArrowDown"
      || event.key === "ArrowRight"
      || event.key === " "
    ) {
      event.preventDefault();
      scrollToPhotograph(getNextPhotograph());
    }
  });

  window.addEventListener("scroll", requestFocusUpdate, { passive: true });
  window.addEventListener("scroll", updatePhotographyFocusState, { passive: true });
  window.addEventListener("resize", requestFocusUpdate);
  window.addEventListener("load", () => {
    requestFocusUpdate();
    updatePhotographyFocusState();
  });

  backToTopLink?.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  });

  updatePhotographyFocusState();
}

document.querySelectorAll(".content a[href]").forEach((link) => {
  if (!(link instanceof HTMLAnchorElement)) return;

  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return;
  }

  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin) return;

  link.classList.add("content-link--internal");
});

/*
* If in markdown text immediately follows an image then they both get
* put into a <p>. Using js to find those <p>s and adding class so that
* the image floats left.
*/
const markdownPs: NodeListOf<HTMLParagraphElement> = document.querySelectorAll('.content p')
Array.from(markdownPs).forEach(p => {
  const hasImg:boolean = Array.from(p.childNodes).filter(node => node.nodeName === "IMG").length >= 1
  const hasText:boolean = Array.from(p.childNodes).filter(node => node.nodeName === "#text").length >= 1
  const isFigcaption:boolean = Array.from(p.childNodes).filter(node => {
    if(node.nodeName === "#text") return false;
    return (node as HTMLElement).classList.contains("figcaption")
  }).length >= 1
  
  if(hasImg && hasText && !isFigcaption){
    p.classList.add("float-img-child")
    p.classList.add("clearfix")
  }  
});
