"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PixelIcon from "@/components/ui/PixelIcon";
import { useAuth } from "@/lib/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const FEATURES = [
  {
    icon: "rpg",
    title: "RPG Pixel Art",
    desc: "Jelajahi eco town, sungai, sekolah, dan recycle center dalam dunia pixel RPG yang cozy.",
  },
  {
    icon: "mission",
    title: "Daily Missions",
    desc: "Misi harian membuat aksi hijau terasa seperti quest: kumpulkan sampah, belajar, dan recycle.",
  },
  {
    icon: "rank",
    title: "Leaderboards",
    desc: "Naikkan EcoPoints, buka badge langka, dan bersaing dengan EcoWarrior lain.",
  },
  {
    icon: "ai",
    title: "AI EcoAssistant",
    desc: "Companion AI memberi tips lingkungan dan rekomendasi misi sesuai aktivitasmu.",
  },
  {
    icon: "book",
    title: "Education Hub",
    desc: "Artikel, quiz, progress membaca, dan reward belajar menyatu dengan perjalanan game.",
  },
  {
    icon: "xp",
    title: "Level & XP System",
    desc: "Setiap aksi memberi XP, membuka area, item, badge, dan progres dunia yang lebih bersih.",
  },
];

const STATS = [
  { value: "10K+", label: "EcoWarriors", icon: "warrior" },
  { value: "500K+", label: "Sampah Dikumpulkan", icon: "trash" },
  { value: "50+", label: "Misi Tersedia", icon: "quest" },
  { value: "Gratis", label: "Mulai Bermain", icon: "leaf" },
];

const HOW_TO_PLAY = [
  {
    step: "01",
    title: "Daftar EcoWarrior",
    desc: "Masuk sebagai EcoWarrior dan mulai dari taman kota yang masih perlu dibersihkan.",
  },
  {
    step: "02",
    title: "Mainkan Misi",
    desc: "Ambil sampah, bicara dengan NPC, baca edukasi, dan selesaikan quest harian.",
  },
  {
    step: "03",
    title: "Naik Level",
    desc: "Kumpulkan XP, buka badge, naik leaderboard, dan lihat dunia makin hijau.",
  },
];

const ECO_ACTIONS = [
  { label: "Tanam Pohon", icon: "tree" },
  { label: "Jaga Alam", icon: "leaf" },
  { label: "Hemat Energi", icon: "spark" },
  { label: "Lindungi Satwa", icon: "butterfly" },
  { label: "Kurangi Plastik", icon: "bottle" },
];

function PixelLandscape() {
  const stars = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: `${(i * 17 + 9) % 100}%`,
        top: `${(i * 23 + 11) % 62}%`,
        delay: `${(i % 7) * 0.35}s`,
        size: i % 5 === 0 ? "3px" : "2px",
      })),
    []
  );
  const fireflies = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${(i * 29 + 7) % 96}%`,
        top: `${42 + ((i * 17) % 44)}%`,
        delay: `${(i % 6) * 0.45}s`,
      })),
    []
  );

  return (
    <div className="pixel-hero-world" aria-hidden="true">
      <div className="pixel-sky-vignette" />
      <div className="pixel-moon">
        <span />
      </div>
      <div className="pixel-atmospheric-fog pixel-atmospheric-fog-a" />
      <div className="pixel-atmospheric-fog pixel-atmospheric-fog-b" />
      {stars.map((star, i) => (
        <span
          key={i}
          className="pixel-star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
      <span className="pixel-shooting-star pixel-shooting-star-a" />
      <span className="pixel-shooting-star pixel-shooting-star-b" />
      {fireflies.map((fly, i) => (
        <span
          key={`fly-${i}`}
          className="pixel-firefly"
          style={{ left: fly.left, top: fly.top, animationDelay: fly.delay }}
        />
      ))}

      <motion.div
        className="pixel-cloud pixel-cloud-a"
        animate={{ x: [0, 26, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pixel-cloud pixel-cloud-b"
        animate={{ x: [0, -34, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="pixel-skyline">
        {Array.from({ length: 13 }).map((_, i) => (
          <span key={i} style={{ height: `${34 + ((i * 19) % 46)}px` }} />
        ))}
      </div>

      <div className="pixel-wind-turbine pixel-wind-turbine-a">
        <span />
      </div>
      <div className="pixel-wind-turbine pixel-wind-turbine-b">
        <span />
      </div>

      <div className="pixel-tree-line pixel-tree-back" />
      <div className="pixel-tree-line pixel-tree-front" />

      <motion.div
        className="pixel-leaf-field"
        animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} style={{ left: `${(i * 11 + 6) % 96}%`, animationDelay: `${i * 0.4}s` }} />
        ))}
      </motion.div>

      <div className="pixel-land">
        <div className="pixel-river">
          <span />
        </div>
        <div className="pixel-bridge" />
        <div className="pixel-cabin pixel-cabin-left">
          <span className="pixel-roof" />
          <span className="pixel-door" />
          <span className="pixel-window" />
          <span className="pixel-sign">ECO</span>
        </div>
        <div className="pixel-cabin pixel-cabin-right pixel-recycle-center">
          <span className="pixel-roof" />
          <span className="pixel-door" />
          <span className="pixel-window" />
          <span className="pixel-sign">RECYCLE</span>
        </div>
        <div className="pixel-eco-machine pixel-eco-machine-a" />
        <div className="pixel-eco-machine pixel-eco-machine-b" />
        <div className="pixel-mini-npc pixel-mini-npc-a" />
        <div className="pixel-mini-npc pixel-mini-npc-b" />
        <div className="pixel-glowing-plant pixel-glowing-plant-a" />
        <div className="pixel-glowing-plant pixel-glowing-plant-b" />
        <div className="pixel-lantern pixel-lantern-a" />
        <div className="pixel-lantern pixel-lantern-b" />
        <div className="pixel-signboard">PLAY QUEST</div>
        <div className="pixel-hero-character" />
        <div className="pixel-foreground-grass">
          {Array.from({ length: 26 }).map((_, i) => (
            <span key={i} style={{ left: `${(i * 9 + 2) % 100}%`, animationDelay: `${(i % 5) * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial={reduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const authContext = useAuth();
  const isLoggedIn = Boolean(authContext?.user);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="pixelterra-landing">
      <section id="home" className="landing-hero">
        <PixelLandscape />
        <div className="landing-hero-overlay" />

        <motion.div
          className="landing-hero-content"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <div className="pixel-kicker">
            <span className="pixel-kicker-dot" />
            Cozy Eco Pixel RPG
          </div>

          <h1 className="landing-title">
            PIXEL<span>TERRA</span>
          </h1>
          <p className="landing-subtitle">Selamatkan bumi, satu misi pada satu waktu</p>
          <p className="landing-description">
            Masuki dunia pixel RPG bernuansa malam hijau, selesaikan quest lingkungan,
            kumpulkan EcoPoints, dan ubah kota kecil menjadi ekosistem yang hidup.
          </p>

          <div className="landing-actions">
            <Link href={isLoggedIn ? "/game" : "/register"} className="pixel-launch-button pixel-launch-button-primary">
              Mulai Petualangan
            </Link>
            <Link href={isLoggedIn ? "/game" : "/login"} className="pixel-launch-button pixel-launch-button-secondary">
              Buka Game
            </Link>
          </div>

          <div className="eco-action-row">
            {ECO_ACTIONS.map((item) => (
              <motion.div
                key={item.label}
                className="eco-action-chip"
                whileHover={{ y: -5, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
              >
                <PixelIcon type={item.icon} className="is-nav" />
                <span>{item.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="hero-gameplay-hud"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <div className="hero-quest-popup">
              <PixelIcon type="quest" className="is-nav" />
              <div>
                <span>Quest Aktif</span>
                <strong>Bersihkan Sungai Kota</strong>
                <small>Progress 3/5 sampah</small>
              </div>
            </div>
            <div className="hero-xp-gain">+120 XP</div>
            <div className="hero-world-status">
              <span>WORLD CLEAN</span>
              <strong>68%</strong>
              <i />
            </div>
            <div className="hero-badge-preview">
              <PixelIcon type="badge" className="is-nav" />
              <span>Badge unlock nearby</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section id="leaderboards" className="landing-section landing-stats">
        <div className="landing-section-inner">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <motion.div
                className="pixel-stat-card"
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              >
                <PixelIcon type={stat.icon} className="is-large" />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="landing-section-inner">
          <Reveal className="landing-section-heading">
            <span className="pixel-kicker">Game Ecosystem</span>
            <h2>Fitur Utama</h2>
            <p>
              PixelTerra dirancang seperti portal RPG, bukan dashboard biasa:
              semua progres belajar dan aksi hijau terasa seperti petualangan.
            </p>
          </Reveal>

          <div className="feature-grid">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 0.05}>
                <motion.article
                  className="pixel-feature-card"
                  whileHover={{ y: -10, scale: 1.025 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                >
                  <PixelIcon type={feature.icon} className="is-large" />
                  <span className="feature-module-tag">MODULE {String(i + 1).padStart(2, "0")}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                  <div className="feature-module-progress">
                    <span style={{ width: `${62 + i * 5}%` }} />
                  </div>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="landing-section how-play-section">
        <div className="landing-section-inner">
          <Reveal className="landing-section-heading">
            <span className="pixel-kicker">RPG Menu</span>
            <h2>Cara Bermain</h2>
            <p>Masuk sebagai EcoWarrior, jalankan quest, lalu lihat dunia berubah mengikuti aksi pemain.</p>
          </Reveal>

          <div className="how-play-track">
            {HOW_TO_PLAY.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.08} className="how-play-step-wrap">
                <motion.article
                  className="how-play-step"
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 240, damping: 18 }}
                >
                  <span className="step-number">{item.step}</span>
                  <PixelIcon type={i === 0 ? "warrior" : i === 1 ? "quest" : "xp"} className="is-large" />
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <Reveal className="landing-cta">
          <div className="landing-cta-glow" />
          <span className="pixel-kicker">EcoWarrior Call</span>
          <h2>Siap Menjadi EcoWarrior?</h2>
          <p>
            Nyalakan lentera, masuk ke eco town, dan mulai quest pertamamu.
            Dunia pixel ini menunggu aksi kecil yang berdampak besar.
          </p>
          <div className="landing-actions">
            <Link href={isLoggedIn ? "/game" : "/register"} className="pixel-launch-button pixel-launch-button-primary">
              {isLoggedIn ? "Masuk ke Eco World" : "Daftar EcoWarrior"}
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="landing-footer landing-terminal-footer">
        <div className="terminal-brand">
          <strong>PixelTerra</strong>
          <span>Modern eco pixel RPG learning platform</span>
        </div>
        <div className="terminal-status-grid" aria-label="PixelTerra system status">
          <span><b>SYSTEM</b> ONLINE</span>
          <span><b>CLEANLINESS</b> 68%</span>
          <span><b>ECOWARRIORS</b> 10K+</span>
          <span><b>QUESTS</b> 4,219 DONE</span>
        </div>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/#about">About</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </nav>
      </footer>
    </div>
  );
}
