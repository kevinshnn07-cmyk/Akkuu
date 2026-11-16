import {
  ArrowRight,
  Code2,
  Github,
  Linkedin,
  Mouse,
  Play,
  Terminal,
  Twitter,
  X,
  Youtube,
} from 'lucide-react';
import {FormEvent, useEffect, useRef, useState} from 'react';

type NavSection = 'home' | 'work' | 'coding' | 'about' | 'contact';

interface ContactFormState {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const NAV_ITEMS: {id: NavSection; label: string}[] = [
  {id: 'home', label: 'Home'},
  {id: 'work', label: 'Work'},
  {id: 'coding', label: 'Coding'},
  {id: 'about', label: 'About'},
  {id: 'contact', label: 'Contact'},
];

const WORK_ITEMS = [
  {
    year: '2026',
    title: 'Vortex Packet Inspector',
    scope: 'Systems Engineering · Rust & eBPF',
    summary:
      'Low-latency kernel traffic visualizer processing 1.2M packets per second with deterministic memory bounds.',
  },
  {
    year: '2025',
    title: 'ZeroTrace Vault',
    scope: 'Cryptography · TypeScript & WebAssembly',
    summary:
      'End-to-end encrypted secret sharing workspace running hardware-backed key derivation directly in the browser.',
  },
  {
    year: '2024',
    title: 'Gridline Runtime Shell',
    scope: 'Developer Tooling · Go & WebSockets',
    summary:
      'Browser-native terminal multiplexer with session replay, live RBAC policies, and sub-20ms keystroke sync.',
  },
];

const CODING_DISCIPLINES = [
  {
    title: 'Frontend Architecture',
    stack: 'React 19, TypeScript, WebGL, Tailwind CSS',
    note: 'Interactive interfaces built for zero-latency responsiveness and strict accessibility.',
  },
  {
    title: 'Systems & Security',
    stack: 'Rust, Go, Linux eBPF, WireGuard, TLS 1.3',
    note: 'Hardened network daemons, protocol parsers, and automated threat isolation pipelines.',
  },
  {
    title: 'Distributed Backends',
    stack: 'Node.js, PostgreSQL, Redis Streams, gRPC',
    note: 'Fault-tolerant telemetry ingestion services designed for predictable horizontal scale.',
  },
];

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef(0);
  const lastSeekTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const isScrubModeRef = useRef(false);
  const [activeNav, setActiveNav] = useState<NavSection>('home');
  const [demoOpen, setDemoOpen] = useState(false);
  const [formState, setFormState] = useState<ContactFormState>({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const SENSITIVITY = 0.8;
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    const noHoverQuery = window.matchMedia('(hover: none)');

    const isMobileOrTablet = () =>
      coarsePointerQuery.matches ||
      noHoverQuery.matches ||
      window.innerWidth < 1024;

    const syncPlaybackMode = () => {
      if (isMobileOrTablet()) {
        isScrubModeRef.current = false;
        isSeekingRef.current = false;
        prevXRef.current = null;
        video.loop = true;
        if (reducedMotionQuery.matches) {
          video.pause();
        } else {
          video.play().catch(() => {
            // Muted playsInline playback fallback
          });
        }
      } else {
        isScrubModeRef.current = true;
        video.loop = false;
        video.pause();
        targetTimeRef.current = video.currentTime || 0;
        lastSeekTimeRef.current = video.currentTime || 0;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isScrubModeRef.current) {
        return;
      }

      const currentX = event.clientX;
      if (prevXRef.current === null) {
        prevXRef.current = currentX;
        return;
      }

      const delta = currentX - prevXRef.current;
      prevXRef.current = currentX;

      if (
        !Number.isFinite(video.duration) ||
        video.duration <= 0 ||
        window.innerWidth <= 0
      ) {
        return;
      }

      const timeOffset =
        (delta / window.innerWidth) * SENSITIVITY * video.duration;
      const nextTargetTime = Math.max(
        0,
        Math.min(video.duration, targetTimeRef.current + timeOffset),
      );
      targetTimeRef.current = nextTargetTime;

      if (
        !isSeekingRef.current &&
        Math.abs(nextTargetTime - lastSeekTimeRef.current) > 0.001
      ) {
        isSeekingRef.current = true;
        lastSeekTimeRef.current = nextTargetTime;
        video.currentTime = nextTargetTime;
      }
    };

    syncPlaybackMode();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', syncPlaybackMode);
    reducedMotionQuery.addEventListener('change', syncPlaybackMode);
    coarsePointerQuery.addEventListener('change', syncPlaybackMode);
    noHoverQuery.addEventListener('change', syncPlaybackMode);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', syncPlaybackMode);
      reducedMotionQuery.removeEventListener('change', syncPlaybackMode);
      coarsePointerQuery.removeEventListener('change', syncPlaybackMode);
      noHoverQuery.removeEventListener('change', syncPlaybackMode);
    };
  }, []);

  const handleVideoSeeked = () => {
    if (!isScrubModeRef.current) {
      isSeekingRef.current = false;
      return;
    }

    const video = videoRef.current;
    if (!video) {
      isSeekingRef.current = false;
      return;
    }

    if (Math.abs(targetTimeRef.current - lastSeekTimeRef.current) > 0.001) {
      const queuedTarget = targetTimeRef.current;
      lastSeekTimeRef.current = queuedTarget;
      video.currentTime = queuedTarget;
    } else {
      isSeekingRef.current = false;
    }
  };

  useEffect(() => {
    if (!demoOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDemoOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [demoOpen]);

  const scrollToSection = (id: NavSection) => {
    setActiveNav(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({behavior: 'smooth'});
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (!formState.name.trim()) {
      nextErrors.name = 'Enter your name.';
    }

    const emailValue = formState.email.trim();
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!formState.message.trim()) {
      nextErrors.message = 'Include a brief project note.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
  };

  const handleReset = () => {
    setFormState({name: '', email: '', message: ''});
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#040705] text-white">
      <section
        id="home"
        aria-label="Hero"
        className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col justify-between"
      >
        {/* Unobstructed background video with zero overlay */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          src="/hero-video.mp4"
          poster="/hero-poster.jpg"
          muted
          playsInline
          preload="auto"
          onSeeked={handleVideoSeeked}
        />

        {/* Top HUD Navigation */}
        <header className="relative z-10 w-full">
          <div className="max-w-[1380px] mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between gap-8">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
              className="font-display text-xl sm:text-2xl font-extrabold tracking-wide whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22ff66]"
            >
              <span className="text-[#22ff66]">NEO</span>
              <span className="text-white font-semibold">.dev</span>
            </a>

            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center gap-2 lg:gap-4 h-full"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    className={`relative h-full px-4 flex items-center text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22ff66] ${
                      isActive
                        ? 'text-white border-b-2 border-[#22ff66]'
                        : 'text-neutral-300 hover:text-white border-b-2 border-transparent'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="hud-chamfer min-h-[40px] px-4 py-2 border border-[#22ff66]/75 text-xs sm:text-sm font-mono font-medium text-[#22ff66] hover:bg-[#22ff66] hover:text-black transition-colors duration-150 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22ff66]"
              >
                <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Let&apos;s Connect</span>
              </button>
            </div>
          </div>

          {/* Top HUD Stepped Accent Line */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 14"
            preserveAspectRatio="none"
            className="w-full h-[14px] block pointer-events-none"
          >
            <polyline
              fill="none"
              stroke="rgba(34, 255, 102, 0.55)"
              strokeWidth="1.25"
              points="0,2 72,2 86,12 220,12 234,2 1210,2 1224,12 1360,12 1374,2 1440,2"
            />
          </svg>
        </header>

        {/* Left Side HUD Corner Notch */}
        <svg
          aria-hidden="true"
          viewBox="0 0 28 240"
          className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-7 h-60 z-10 pointer-events-none"
        >
          <polyline
            fill="none"
            stroke="rgba(34, 255, 102, 0.55)"
            strokeWidth="1.5"
            points="0,0 24,20 24,105 8,120 8,240"
          />
        </svg>

        {/* Main Hero Content */}
        <div className="relative z-10 w-full max-w-[1380px] mx-auto px-6 lg:px-14 py-12 my-auto">
          <div className="max-w-2xl">
            <p className="font-mono text-xs sm:text-sm tracking-[0.2em] text-[#22ff66] uppercase">
              // SYSTEM ONLINE_
            </p>

            <h1 className="mt-4 font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-black leading-[1.02] tracking-tight uppercase [text-wrap:balance]">
              <span className="block text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)]">
                BEYOND
              </span>
              <span className="block mt-1">
                <span className="text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)]">
                  THE{' '}
                </span>
                <span className="text-[#22ff66] drop-shadow-[0_0_24px_rgba(34,255,102,0.55)]">
                  CODE.
                </span>
              </span>
            </h1>

            <div className="mt-6 flex items-stretch gap-4 max-w-lg">
              <span
                aria-hidden="true"
                className="w-[3px] shrink-0 bg-[#22ff66] shadow-[0_0_12px_rgba(34,255,102,0.75)]"
              />
              <p className="font-mono text-sm sm:text-base leading-relaxed text-neutral-100 drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
                I&apos;m a creative developer who transforms ideas into powerful
                digital experiences. Exploring technology, building the future,
                one line at a time.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => scrollToSection('work')}
                className="min-h-[46px] px-6 py-3 bg-[#22ff66] hover:bg-[#3bff7a] text-black font-semibold text-sm rounded-md shadow-[0_0_24px_rgba(34,255,102,0.45)] transition-all duration-150 flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Code2 className="w-4 h-4" aria-hidden="true" />
                <span>Explore My Work</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setDemoOpen(true)}
                className="hud-chamfer min-h-[46px] px-6 py-3 border border-[#22ff66]/65 hover:border-[#22ff66] text-white hover:text-[#22ff66] font-semibold text-sm transition-colors duration-150 flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22ff66]"
              >
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progressive Upward-Fading Bottom Blur */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 sm:h-52 z-[5] backdrop-blur-lg bg-gradient-to-t from-[#040705] via-[#040705]/40 to-transparent [mask-image:linear-gradient(to_top,black_0%,rgba(0,0,0,0.85)_35%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_top,black_0%,rgba(0,0,0,0.85)_35%,transparent_100%)]"
        />

        {/* Bottom HUD Frame Bar */}
        <div className="relative z-10 w-full">
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 28"
            preserveAspectRatio="none"
            className="w-full h-[28px] block pointer-events-none"
          >
            <polyline
              fill="none"
              stroke="rgba(34, 255, 102, 0.55)"
              strokeWidth="1.25"
              points="0,4 140,4 158,20 340,20 356,6 635,6 650,24 790,24 805,6 1084,6 1100,20 1282,20 1300,4 1440,4"
            />
          </svg>

          <div className="max-w-[1380px] mx-auto px-6 lg:px-10 pb-4 pt-1 flex items-center justify-between gap-4">
            <p className="font-mono text-xs text-[#22ff66]/85 whitespace-nowrap">
              // Code · Create · Innovate
            </p>

            <button
              type="button"
              onClick={() => scrollToSection('work')}
              className="flex flex-col items-center gap-1 text-[#22ff66] hover:text-white transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22ff66]"
              aria-label="Scroll down to selected work"
            >
              <Mouse className="w-4 h-4" aria-hidden="true" />
              <span className="font-mono text-[11px] tracking-wide whitespace-nowrap">
                Scroll Down
              </span>
            </button>

            <div className="flex items-center gap-4 text-neutral-300">
              <a
                href="#work"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('work');
                }}
                aria-label="GitHub projects"
                className="hover:text-[#22ff66] transition-colors duration-150 p-1"
              >
                <Github className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('about');
                }}
                aria-label="LinkedIn profile"
                className="hover:text-[#22ff66] transition-colors duration-150 p-1"
              >
                <Linkedin className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#coding"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('coding');
                }}
                aria-label="YouTube demos"
                className="hover:text-[#22ff66] transition-colors duration-150 p-1"
              >
                <Youtube className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('contact');
                }}
                aria-label="X / Twitter contact"
                className="hover:text-[#22ff66] transition-colors duration-150 p-1"
              >
                <Twitter className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Clean, Card-Free Portfolio Sections Below */}
      <main>
        <section id="work" className="py-20 border-t border-white/10">
          <div className="max-w-[1140px] mx-auto px-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Selected Work
            </h2>
            <p className="mt-3 text-base text-neutral-400 max-w-2xl">
              Production systems, cryptographic tools, and real-time developer
              interfaces shipped over the past three years.
            </p>

            <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
              {WORK_ITEMS.map((item) => (
                <article
                  key={item.title}
                  className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline"
                >
                  <div className="md:col-span-2 font-mono text-sm text-[#22ff66] tabular-nums">
                    {item.year}
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="text-lg font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs font-mono text-neutral-400">
                      {item.scope}
                    </p>
                  </div>
                  <p className="md:col-span-6 text-sm sm:text-base text-neutral-300 leading-relaxed">
                    {item.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="coding" className="py-20 border-t border-white/10">
          <div className="max-w-[1140px] mx-auto px-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Engineering Focus
            </h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              {CODING_DISCIPLINES.map((discipline, idx) => (
                <div key={discipline.title}>
                  <p className="font-mono text-xs text-[#22ff66] tabular-nums">
                    0{idx + 1}.
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {discipline.title}
                  </h3>
                  <p className="mt-2 font-mono text-xs text-neutral-400">
                    {discipline.stack}
                  </p>
                  <p className="mt-3 text-sm text-neutral-300 leading-relaxed">
                    {discipline.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-20 border-t border-white/10">
          <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                About
              </h2>
            </div>
            <div className="md:col-span-8 space-y-4 text-base text-neutral-300 leading-relaxed max-w-2xl">
              <p>
                I work at the intersection of creative web engineering and
                low-level network security—pairing expressive, responsive
                interfaces with resilient cryptographic infrastructure.
              </p>
              <p>
                Available for select product architecture engagements, technical
                audits, and greenfield web applications.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 border-t border-white/10">
          <div className="max-w-[1140px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Let&apos;s Connect
              </h2>
              <p className="mt-4 text-base text-neutral-400 leading-relaxed">
                Have an upcoming build or security engineering project? Send a
                direct note below.
              </p>
              <p className="mt-6 font-mono text-sm text-[#22ff66]">
                hello@neo.dev
              </p>
            </div>

            <div className="lg:col-span-7">
              {submitted ? (
                <div className="py-4 border-t border-[#22ff66]/40">
                  <h3 className="text-xl font-semibold text-white">
                    Message Sent
                  </h3>
                  <p className="mt-3 text-base text-neutral-300 leading-relaxed">
                    Thanks, {formState.name}. Your note from{' '}
                    <span className="text-white font-medium">
                      {formState.email}
                    </span>{' '}
                    has been queued.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-6 min-h-[40px] px-4 py-2 border border-[#22ff66]/60 text-sm font-mono text-[#22ff66] hover:bg-[#22ff66] hover:text-black rounded-md transition-colors duration-150 cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-medium text-neutral-200"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={formState.name}
                      onChange={(e) => {
                        setFormState({...formState, name: e.target.value});
                        if (errors.name) {
                          setErrors({...errors, name: undefined});
                        }
                      }}
                      placeholder="Alex Mercer"
                      className="mt-2 w-full min-h-[44px] px-3.5 py-2 text-base text-white bg-black/60 border border-white/20 rounded-md focus:outline-none focus:border-[#22ff66]"
                    />
                    {errors.name && (
                      <p role="alert" className="mt-1.5 text-sm text-red-400">
                        Error: {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-medium text-neutral-200"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={formState.email}
                      onChange={(e) => {
                        setFormState({...formState, email: e.target.value});
                        if (errors.email) {
                          setErrors({...errors, email: undefined});
                        }
                      }}
                      placeholder="alex@company.com"
                      className="mt-2 w-full min-h-[44px] px-3.5 py-2 text-base text-white bg-black/60 border border-white/20 rounded-md focus:outline-none focus:border-[#22ff66]"
                    />
                    {errors.email && (
                      <p role="alert" className="mt-1.5 text-sm text-red-400">
                        Error: {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-neutral-200"
                    >
                      Project Note
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formState.message}
                      onChange={(e) => {
                        setFormState({...formState, message: e.target.value});
                        if (errors.message) {
                          setErrors({...errors, message: undefined});
                        }
                      }}
                      placeholder="Scope, timeline, or technical goals..."
                      className="mt-2 w-full px-3.5 py-2.5 text-base text-white bg-black/60 border border-white/20 rounded-md focus:outline-none focus:border-[#22ff66]"
                    />
                    {errors.message && (
                      <p role="alert" className="mt-1.5 text-sm text-red-400">
                        Error: {errors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="min-h-[44px] px-6 py-2.5 bg-[#22ff66] hover:bg-[#3bff7a] text-black text-sm font-semibold rounded-md transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22ff66]"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-[1140px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          <span>
            <strong className="text-white">NEO.dev</strong> · Beyond the Code
          </span>
          <span>© 2026 NEO.dev. All rights reserved.</span>
        </div>
      </footer>

      {/* Watch Demo Video Modal */}
      {demoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Showreel Demo Video"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setDemoOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#070d09] border border-[#22ff66]/45 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-4">
              <span className="font-mono text-xs text-[#22ff66]">
                DEMO REEL · BEYOND THE CODE
              </span>
              <button
                type="button"
                onClick={() => setDemoOpen(false)}
                aria-label="Close demo video"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-neutral-300 hover:text-white rounded-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#22ff66]"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <video
              className="w-full aspect-video bg-black"
              src="/hero-video.mp4"
              poster="/hero-poster.jpg"
              controls
              autoPlay
              playsInline
            />
          </div>
        </div>
      )}
    </div>
  );
}
