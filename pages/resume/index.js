import { getLayout as getBlogLayout } from "../../layouts/BlogLayout";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { HStack, Button, Link } from "@chakra-ui/react";
import { DownloadIcon, CopyIcon, CheckIcon } from "@chakra-ui/icons";
import { layoutChars } from "../../components/pretext";

/* noolog-landing "White-Flame" treatment for the resume page: teal consensus
   accent, negative-film navy + starfield by night, Inter for prose, JetBrains
   Mono kickers. Motion uses the landing's actual patterns: the portal beam-in
   (pretext layoutChars per-character depth rake) on the title, and the
   IntersectionObserver scroll reveals. */

const Post = () => {
  const Component = lazy(() => import(`../../content/resume.mdx`));
  const [copied, setCopied] = useState(false);
  const rootRef = useRef(null);

  const copyMarkdown = async () => {
    const md = await fetch("/resume.md").then((r) => r.text());
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let done = false;
    let io;
    const enhance = () => {
      const h1 = root.querySelector("h1");
      if (!h1 || done) return false;
      done = true;

      if (!reduce) {
        // Portal beam-in on the title — the landing's spawnBeam pattern: each
        // word measured with pretext.layoutChars, every glyph absolutely
        // placed and raked in depth (left chars near the reader, right chars
        // deep), then the word rises in like a light ray and settles.
        const original = h1.textContent;
        const cs = window.getComputedStyle(h1);
        const cfg = {
          size: parseFloat(cs.fontSize),
          weight: cs.fontWeight,
          family: cs.fontFamily,
        };
        const Z_SPREAD = 220; // px of depth raked across a word
        const wordsArr = original.split(/\s+/).filter(Boolean);
        h1.classList.add("wtitle");
        h1.textContent = "";
        let pending = wordsArr.length;
        const wordEls = wordsArr.map((w, i) => {
          const lay = layoutChars(w, cfg);
          const el = document.createElement("span");
          el.className = "wword";
          el.style.width = lay.width + "px";
          el.style.height = "1em";
          lay.chars.forEach((c) => {
            const s = document.createElement("span");
            s.className = "wchar";
            s.textContent = c.ch;
            const depth = (0.5 - (lay.width ? c.x / lay.width : 0)) * Z_SPREAD;
            s.style.left = c.x + "px";
            s.style.transform = "translateZ(" + depth.toFixed(1) + "px)";
            el.appendChild(s);
          });
          const settle = () => {
            // settle: once every word has landed, restore plain selectable text
            if (pending > 0 && --pending === 0) {
              h1.classList.remove("wtitle");
              h1.textContent = original;
            }
          };
          el.addEventListener("animationend", settle);
          h1.appendChild(el);
          if (i < wordsArr.length - 1)
            h1.appendChild(document.createTextNode(" "));
          return el;
        });
        wordEls.forEach((el, i) =>
          setTimeout(() => el.classList.add("go"), 80 + i * 135)
        );
        // safety net: if animations never run (stalled rAF/headless), settle anyway
        setTimeout(() => {
          if (pending > 0) {
            pending = 0;
            h1.classList.remove("wtitle");
            h1.textContent = original;
          }
        }, 80 + wordsArr.length * 135 + 2200);
      }

      // scroll reveals on everything below the title
      const targets = root.querySelectorAll("h2, h3, h4, p, ul, ol, div.chakra-stack");
      if (reduce || !("IntersectionObserver" in window)) return true;
      io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          }),
        { threshold: 0.08 }
      );
      targets.forEach((el) => {
        el.classList.add("reveal");
        io.observe(el);
      });
      return true;
    };

    // MDX mounts lazily behind Suspense — watch until the h1 appears
    if (!enhance()) {
      const mo = new MutationObserver(() => {
        if (enhance()) mo.disconnect();
      });
      mo.observe(root, { childList: true, subtree: true });
      return () => {
        mo.disconnect();
        if (io) io.disconnect();
      };
    }
    return () => io && io.disconnect();
  }, []);

  return (
    <div id="noolog-resume" ref={rootRef}>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap");

        #noolog-resume {
          /* noolog White-Flame tokens — light (day) */
          --nl-consensus: #009e97;
          --nl-orange: #ff9500;
          --nl-novel: #af52de;
          --nl-agency: #ffc83d;
          --nl-bg: #ffffff;
          --nl-panel: #f5f5f5;
          --nl-border: #e5e5ea;
          --nl-text: #1d1d1f;
          --nl-text-2: #6e6e73;
          --nl-font-ui: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          --nl-font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo,
            monospace;
          /* Gear-5 spring — CSS linear(), real overshoot physics */
          --nl-spring: linear(
            0, 0.006, 0.219 6%, 0.678, 1.176 24%, 1.259, 1.257, 1.18, 1.056,
            0.968 46%, 0.938, 0.948, 0.988, 1.02, 1.028, 1.014 78%, 0.998,
            0.996, 1
          );
        }
        body.chakra-ui-dark #noolog-resume {
          /* negative-film moon-sky */
          --nl-bg: #060a18;
          --nl-panel: #0c1226;
          --nl-border: #1e2c48;
          --nl-text: #eaf2ff;
          --nl-text-2: #93a6c4;
        }

        /* signature starfield behind the whole viewport, night only */
        body.chakra-ui-dark #noolog-resume::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background: #060a18
            radial-gradient(1px 1px at 20% 30%, rgba(147, 166, 196, 0.5), transparent),
            radial-gradient(1px 1px at 70% 20%, rgba(0, 158, 151, 0.35), transparent),
            radial-gradient(1px 1px at 45% 70%, rgba(191, 233, 255, 0.35), transparent),
            radial-gradient(1px 1px at 85% 60%, rgba(147, 166, 196, 0.4), transparent);
        }
        body.chakra-ui-light #noolog-resume::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background: #ffffff;
        }

        #noolog-resume,
        #noolog-resume p,
        #noolog-resume li {
          font-family: var(--nl-font-ui);
          color: var(--nl-text);
        }
        #noolog-resume p {
          color: var(--nl-text-2);
          font-size: 15px;
          line-height: 1.65;
        }
        #noolog-resume p strong,
        #noolog-resume li strong {
          color: var(--nl-text);
          font-weight: 600;
        }
        #noolog-resume li {
          color: var(--nl-text-2);
          font-size: 14.5px;
        }

        /* ---- headings ---- */
        #noolog-resume h1 {
          font-family: var(--nl-font-ui);
          font-weight: 800;
          font-size: clamp(34px, 6vw, 56px);
          line-height: 1.05;
          letter-spacing: -1.2px;
          color: var(--nl-text);
        }
        #noolog-resume h2 {
          font-family: var(--nl-font-ui);
          font-weight: 600;
          font-size: 26px;
          letter-spacing: -0.3px;
          color: var(--nl-text);
          border-bottom: 1px solid var(--nl-border);
          padding-bottom: 10px;
        }
        #noolog-resume h3 {
          font-family: var(--nl-font-ui);
          font-weight: 700;
          font-size: 18px;
          color: var(--nl-consensus);
          letter-spacing: -0.2px;
        }
        #noolog-resume h4 {
          font-family: var(--nl-font-mono);
          font-size: 12px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--nl-text-2);
        }

        /* date lines (italic em under each role) → mono kicker */
        #noolog-resume h3 + p em,
        #noolog-resume h1 + p em {
          font-family: var(--nl-font-mono);
          font-style: normal;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--nl-consensus);
        }

        /* ---- links: teal, like every noolog surface ---- */
        #noolog-resume a {
          color: var(--nl-consensus);
          text-decoration: underline;
          text-decoration-color: rgba(0, 158, 151, 0.35);
          text-underline-offset: 3px;
          transition: text-decoration-color 200ms ease;
        }
        #noolog-resume a:hover {
          text-decoration-color: var(--nl-consensus);
        }

        /* language tags → sovereignty trust-badge look */
        #noolog-resume .chakra-tag {
          font-family: var(--nl-font-mono);
          font-size: 12px;
          color: var(--nl-consensus);
          background: rgba(0, 158, 151, 0.08);
          border: 1px solid rgba(0, 158, 151, 0.4);
          border-radius: 8px;
        }

        /* ---- action buttons → noolog .btn ---- */
        #noolog-resume .nl-btn {
          font-family: var(--nl-font-ui);
          font-weight: 600;
          font-size: 14px;
          border-radius: 8px;
          border: 1px solid transparent;
          transition: transform 620ms var(--nl-spring), box-shadow 200ms ease;
        }
        #noolog-resume .nl-btn:hover {
          transform: scale(1.08, 0.94); /* Gear-5 squash-and-stretch pop */
          text-decoration: none;
        }
        #noolog-resume .nl-btn-primary {
          background: var(--nl-consensus);
          color: #ffffff;
        }
        #noolog-resume .nl-btn-primary:hover {
          background: var(--nl-consensus);
          box-shadow: 0 6px 20px rgba(0, 158, 151, 0.35);
        }
        #noolog-resume .nl-btn-ghost {
          background: transparent;
          color: var(--nl-text);
          border-color: var(--nl-border);
        }
        #noolog-resume .nl-btn-ghost:hover {
          background: transparent;
          border-color: var(--nl-consensus);
        }

        /* page kicker above the title */
        #noolog-resume .nl-kicker {
          font-family: var(--nl-font-mono);
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--nl-consensus);
          margin-top: 24px;
        }

        /* ---- motion: portal beam-in title (landing spawnBeam pattern) ---- */
        #noolog-resume h1.wtitle {
          perspective: 1100px;
        }
        #noolog-resume .wword {
          display: inline-block;
          position: relative;
          transform-style: preserve-3d;
          opacity: 0;
          will-change: transform, opacity;
        }
        #noolog-resume .wword .wchar {
          position: absolute;
          top: 0;
          will-change: transform;
        }
        #noolog-resume .wword.go {
          animation: nl-beam-in 1200ms cubic-bezier(0.22, 0.68, 0.28, 1)
            forwards;
          text-shadow: 0 0 20px rgba(191, 233, 255, 0.55);
        }
        /* the landing's beam-in ray, retargeted to settle in place */
        @keyframes nl-beam-in {
          0% {
            opacity: 0;
            transform: translateY(90px) translateZ(-1300px) scale(0.5);
          }
          35% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: none;
          }
        }
        #noolog-resume .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 700ms ease, transform 700ms var(--nl-spring);
        }
        #noolog-resume .reveal.in {
          opacity: 1;
          transform: none;
        }

        @media (prefers-reduced-motion: reduce) {
          #noolog-resume .wword,
          #noolog-resume .reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
            animation: none !important;
          }
        }
        @media print {
          #noolog-resume .wword,
          #noolog-resume .reveal {
            opacity: 1 !important;
            transform: none !important;
          }
          #noolog-resume::before {
            display: none !important;
          }
        }
      `}</style>

      <p className="nl-kicker">Resume · updated continuously</p>

      <HStack
        spacing={3}
        mt={4}
        justify="flex-end"
        sx={{ "@media print": { display: "none" } }}
      >
        <Button
          as={Link}
          href="/resume.pdf"
          download="Tims-Pecerskis-Resume.pdf"
          size="sm"
          className="nl-btn nl-btn-primary"
          leftIcon={<DownloadIcon />}
          _hover={{ textDecoration: "none" }}
        >
          Download PDF
        </Button>
        <Button
          size="sm"
          className="nl-btn nl-btn-ghost"
          leftIcon={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={copyMarkdown}
        >
          {copied ? "Copied" : "Copy Markdown"}
        </Button>
      </HStack>
      <Suspense fallback={<div>Loading...</div>}>{<Component />}</Suspense>
    </div>
  );
};
export async function getStaticProps() {
  const metaTags = {
    title: "Resume — Tims Pečerskis",
    description:
      "Professional experience of Tims Pečerskis (Peersky): 15+ years across AI, blockchain, embedded, RF and microwave R&D.",
    keywords:
      "resume, cv, Tims Pecerskis, Peersky, engineer, blockchain, AI, embedded, microwave, RF",
    url: `https://peersky.xyz/resume`,
  };
  return {
    props: {
      metaTags: { ...metaTags },
    },
  };
}
Post.getLayout = getBlogLayout();
export default Post;
