import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logocar.png';

// Fallback logo URL
const LOGO_URL = "https://raw.githubusercontent.com/Praveen-Kumar-Khatri/and-readme/main/logocar.png";

const StaggeredMenu = ({
  position = 'right',
  colors = ['#1e1e22', '#35353c'],
  items = [],
  socialItems = [],
  displaySocials = false,
  displayItemNumbering = true,
  className,
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  accentColor = '#f97316',
  isFixed = false,
  changeMenuColorOnOpen = true,
  closeOnClickAway = true,
  isLoggedIn = false,
  onLogout = () => {}
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);

  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);

  const textInnerRef = useRef(null);
  const textWrapRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);

  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);

  const navigate = useNavigate();

  // Define menu items based on auth state
  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to Home', link: '/' },
    { label: 'Vendors', ariaLabel: 'Go to Vendors', link: '/vendors' },
    { label: 'Cars', ariaLabel: 'Go to Cars', link: '/cars' },
    { label: 'Bookings', ariaLabel: 'Go to My Bookings', link: '/bookings' },
    { label: 'Contact', ariaLabel: 'Go to Contact', link: '/contact' },
  ];

  // Add auth items based on login status
  const authItems = isLoggedIn 
    ? [{ label: 'Logout', ariaLabel: 'Logout', link: '#' }]
    : [
        { label: 'Login', ariaLabel: 'Go to Login', link: '/login' },
        { label: 'Sign Up', ariaLabel: 'Go to Sign Up', link: '/signup' },
      ];

  const allItems = [...menuItems, ...authItems];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;

      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });

      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });

      gsap.set(textInner, { yPercent: 0 });

      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    if (openTlRef.current) openTlRef.current.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { opacity: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          { duration: 0.6, ease: 'power2.out', opacity: 1, stagger: { each: 0.08, from: 'start' } },
          itemsStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;

      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    if (openTlRef.current) openTlRef.current.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];

    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) gsap.set(numberEls, { opacity: 0 });

        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback((opening) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    if (spinTweenRef.current) spinTweenRef.current.kill();

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, []);

  const animateColor = useCallback(
    (opening) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      if (colorTweenRef.current) colorTweenRef.current.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: 0.18, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  React.useEffect(() => {
    if (toggleBtnRef.current) {
      if (changeMenuColorOnOpen) {
        const targetColor = openRef.current ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color: targetColor });
      } else {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    }
  }, [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]);

  const animateText = useCallback((opening) => {
    const inner = textInnerRef.current;
    if (!inner) return;

    if (textCycleAnimRef.current) textCycleAnimRef.current.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;

    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);

    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });

    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;

    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5 + lineCount * 0.07,
      ease: 'power4.out'
    });
  }, []);

  const handleItemClick = (item) => {
    if (item.link === '#') {
      // Logout action
      onLogout();
    } else {
      navigate(item.link);
    }
    closeMenu();
  };

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);

    if (target) {
      playOpen();
    } else {
      playClose();
    }

    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      playClose();
      animateIcon(false);
      animateColor(false);
      animateText(false);
    }
  }, [playClose, animateIcon, animateColor, animateText]);

  React.useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  return (
    <div
      className={`sm-scope ${isFixed ? 'fixed top-0 left-0 w-screen h-screen' : 'w-full h-full'}`}
    >
      <div
        className={
          (className ? className + ' ' : '') + 'staggered-menu-wrapper relative w-full h-full'
        }
        style={accentColor ? { '--sm-accent': accentColor } : {}}
        data-position={position}
        data-open={open || undefined}
      >
        <div
          ref={preLayersRef}
          className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-[5]"
          aria-hidden="true"
        >
          {(() => {
            const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
            let arr = [...raw];
            if (arr.length >= 3) {
              const mid = Math.floor(arr.length / 2);
              arr.splice(mid, 1);
            }
            return arr.map((c, i) => (
              <div
                key={i}
                className="sm-prelayer absolute top-0 right-0 h-full w-full"
                style={{ background: c }}
              />
            ));
          })()}
        </div>

        <header
          className="staggered-menu-header absolute top-0 left-0 w-full flex items-center justify-between p-4 sm:p-8 bg-transparent z-20"
          aria-label="Main navigation header"
        >
          <div className="sm-logo flex items-center select-none" aria-label="Logo">
            <img
              src={logo}
              alt="Karzone Logo"
              className="sm-logo-img block h-8 w-auto object-contain"
              draggable={false}
            />
          </div>

          <button
            ref={toggleBtnRef}
            className={`sm-toggle relative inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer font-medium leading-none overflow-visible ${
              open ? 'text-black' : 'text-white'
            }`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span
              ref={textWrapRef}
              className="sm-toggle-textWrap relative inline-block h-6 overflow-hidden whitespace-nowrap"
              aria-hidden="true"
            >
              <span ref={textInnerRef} className="sm-toggle-textInner flex flex-col leading-none">
                {textLines.map((l, i) => (
                  <span className="sm-toggle-line block h-6 leading-none" key={i}>
                    {l}
                  </span>
                ))}
              </span>
            </span>

            <span
              ref={iconRef}
              className="sm-icon relative w-4 h-4 shrink-0 inline-flex items-center justify-center"
              aria-hidden="true"
            >
              <span
                ref={plusHRef}
                className="sm-icon-line absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded -translate-x-1/2 -translate-y-1/2"
              />
              <span
                ref={plusVRef}
                className="sm-icon-line absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded -translate-x-1/2 -translate-y-1/2"
              />
            </span>
          </button>
        </header>

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel absolute top-0 right-0 h-full bg-white flex flex-col p-16 sm:p-24 overflow-y-auto z-10 pointer-events-auto"
          aria-hidden={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-5">
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
              role="list"
              data-numbering={displayItemNumbering || undefined}
            >
              {allItems && allItems.length ? (
                allItems.map((it, idx) => (
                  <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={it.label + idx}>
                    <button
                      className="sm-panel-item relative text-black font-bold text-4xl sm:text-5xl cursor-pointer leading-none tracking-tight uppercase transition-colors duration-150 ease-linear inline-block w-full text-left bg-transparent border-none"
                      onClick={() => handleItemClick(it)}
                      aria-label={it.ariaLabel}
                      data-index={idx + 1}
                      type="button"
                    >
                      <span className="sm-panel-itemLabel inline-block">
                        {it.label}
                      </span>
                    </button>
                  </li>
                ))
              ) : (
                <li className="sm-panel-itemWrap relative overflow-hidden leading-none" aria-hidden="true">
                  <span className="sm-panel-item relative text-black font-bold text-4xl cursor-pointer leading-none tracking-tight uppercase">
                    <span className="sm-panel-itemLabel inline-block">
                      No items
                    </span>
                  </span>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      <style>{`
        .sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; }
        .sm-scope .staggered-menu-header { position: absolute; top: 0; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; background: transparent; z-index: 20; }
        .sm-scope .sm-logo { display: flex; align-items: center; user-select: none; }
        .sm-scope .sm-logo-img { display: block; height: 32px; width: auto; object-fit: contain; }
        .sm-scope .sm-toggle { position: relative; display: inline-flex; align-items: center; gap: 0.3rem; background: transparent; border: none; cursor: pointer; font-weight: 500; line-height: 1; overflow: visible; }
        .sm-scope .sm-toggle:focus-visible { outline: 2px solid rgba(255,255,255,0.7); outline-offset: 4px; border-radius: 4px; }
        .sm-scope .sm-toggle-textWrap { position: relative; margin-right: 0.5em; display: inline-block; height: 24px; overflow: hidden; white-space: nowrap; }
        .sm-scope .sm-toggle-textInner { display: flex; flex-direction: column; line-height: 1; }
        .sm-scope .sm-toggle-line { display: block; height: 24px; line-height: 24px; }
        .sm-scope .sm-icon { position: relative; width: 16px; height: 16px; flex: 0 0 16px; display: inline-flex; align-items: center; justify-content: center; }
        .sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
        .sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; height: 100%; background: white; display: flex; flex-direction: column; padding: 6rem 2rem 2rem 2rem; overflow-y: auto; z-index: 10; width: clamp(280px, 50vw, 450px); }
        .sm-scope[data-position='left'] .staggered-menu-panel { right: auto; left: 0; }
        .sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: clamp(280px, 50vw, 450px); pointer-events: none; z-index: 5; }
        .sm-scope[data-position='left'] .sm-prelayers { right: auto; left: 0; }
        .sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; }
        .sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }
        .sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .sm-scope .sm-panel-item { position: relative; color: #000; font-weight: 700; font-size: clamp(2.5rem, 8vw, 4rem); cursor: pointer; line-height: 1; letter-spacing: -2px; text-transform: uppercase; transition: color 0.25s; display: inline-block; text-decoration: none; width: 100%; text-align: left; }
        .sm-scope .sm-panel-itemLabel { display: inline-block; }
        .sm-scope .sm-panel-item:hover { color: var(--sm-accent, #f97316); }
        .sm-scope .sm-panel-list[data-numbering] .sm-panel-item::before { counter-increment: smItem; content: counter(smItem, decimal-leading-zero); position: absolute; top: 0.1em; right: 3.2em; font-size: 18px; font-weight: 400; color: var(--sm-accent, #f97316); letter-spacing: 0; pointer-events: none; user-select: none; opacity: 0; }
        .sm-scope .sm-panel-list[data-numbering] .sm-panel-item:hover::before { opacity: 1; }
        @media (max-width: 1024px) { 
          .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; } 
          .sm-scope .staggered-menu-wrapper[data-open] .sm-logo-img { filter: invert(100%); }
        }
      `}</style>
    </div>
  );
};

export default StaggeredMenu;
