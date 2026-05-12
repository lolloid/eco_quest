"use client";

import Link from "next/link";
import PixelIcon from "@/components/ui/PixelIcon";

function PixelParticleField() {
  return (
    <div className="auth-particles" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => (
        <span
          key={index}
          style={{
            left: `${(index * 17 + 9) % 100}%`,
            top: `${(index * 23 + 13) % 86}%`,
            animationDelay: `${(index % 9) * 0.32}s`,
          }}
        />
      ))}
    </div>
  );
}

export function AuthPixelIcon({ type, className = "" }) {
  return <PixelIcon type={type} className={`is-auth ${className}`} />;
}

export function AuthField({
  id,
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  maxLength,
  required = true,
  action,
}) {
  return (
    <label className="auth-field" htmlFor={id}>
      <span className="auth-label">
        <AuthPixelIcon type={icon} />
        {label}
      </span>
      <span className="auth-input-wrap">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          required={required}
        />
        {action}
      </span>
    </label>
  );
}

export function AuthShell({ mode, title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-world" aria-hidden="true">
        <div className="auth-moon" />
        <div className="auth-city">
          {Array.from({ length: 15 }).map((_, index) => (
            <span key={index} style={{ height: `${42 + ((index * 21) % 74)}px` }} />
          ))}
        </div>
        <div className="auth-turbine auth-turbine-a" />
        <div className="auth-turbine auth-turbine-b" />
        <div className="auth-tree-line auth-tree-back" />
        <div className="auth-tree-line auth-tree-front" />
        <div className="auth-lake">
          <span />
        </div>
        <div className="auth-house auth-house-left">
          <span />
        </div>
        <div className="auth-house auth-house-right">
          <span />
        </div>
        <div className="auth-lamp auth-lamp-a" />
        <div className="auth-lamp auth-lamp-b" />
      </div>

      <PixelParticleField />
      <div className="auth-vignette" aria-hidden="true" />

      <section className={`auth-card auth-card-${mode}`}>
        <div className="auth-card-glow" aria-hidden="true" />
        <div className="auth-card-header">
          <span className="auth-emblem">
            <AuthPixelIcon type="leaf" />
          </span>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
        </div>
        {children}
        <div className="auth-moss auth-moss-left" aria-hidden="true" />
        <div className="auth-moss auth-moss-right" aria-hidden="true" />
      </section>
    </div>
  );
}

export function AuthDivider() {
  return (
    <div className="auth-divider">
      <span />
      <strong>atau</strong>
      <span />
    </div>
  );
}

export function AuthFooterLink({ text, href, label }) {
  return (
    <p className="auth-footer-link">
      {text} <Link href={href}>{label}</Link>
    </p>
  );
}
