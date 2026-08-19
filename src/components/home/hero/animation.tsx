"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Script from "next/script";

import { cn } from "@/lib/utils";

import "./animation.css";

type DbHeroAnimationProps = {
  className?: string;
};

type CssVariableProperties = CSSProperties & {
  [key: `--${string}`]: string | number;
};

type DbHeroPlayer = {
  mount: (root: HTMLElement) => () => void;
};

type DbHeroPlayerWindow = Window & {
  DatabricksHeroPlayer?: DbHeroPlayer;
};

const playerScriptPath = "/js/home-hero-player.js";
const playerScriptVersion = "20260817-route-return";

function cssVars(vars: CssVariableProperties) {
  return vars;
}

function isElementInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  return rect.bottom > 0 && rect.top < window.innerHeight;
}

function dispatchViewportState(element: HTMLElement) {
  window.dispatchEvent(
    new CustomEvent("db-hero-viewport-change", {
      detail: {
        isInViewport: isElementInViewport(element),
      },
    }),
  );
}

function DbHeroPlayerScene() {
  return (
    <div id="toolWorkspace" className="tool-workspace">
      <div id="stageViewport" className="stage-viewport">
        <div id="stageScaler" className="stage-scaler">
          <main
            id="stage"
            className="stage"
            aria-label="Databricks hero animation"
          >
            <div id="stagePerspectiveShell" className="stage-perspective-shell">
              <div
                id="powerOnOverlay"
                className="power-on-overlay"
                aria-hidden="true"
              >
                <span className="power-on-stretch-line"></span>
              </div>
              <div id="preAppScene" className="pre-app-scene">
                <section
                  id="heroLogoReveal"
                  className="hero-logo-reveal fx-layer"
                  aria-hidden="true"
                >
                  <div
                    className="hero-logo hero-logo-svg hero-logo-base"
                    data-logo-svg
                  ></div>
                  <div
                    className="hero-logo hero-logo-svg hero-logo-fill"
                    data-logo-svg
                  ></div>
                </section>
                <section className="install-copy fx-layer" aria-live="polite">
                  <p id="installText" className="terminal-copy"></p>
                </section>
                <section className="prompt-copy fx-layer" aria-live="polite">
                  <p className="prompt-line">
                    <span className="prompt-marker">&gt;</span>
                    <span id="promptText" className="prompt-text"></span>
                  </p>
                </section>
                <section className="build-status fx-layer" aria-live="polite">
                  <p className="build-title" data-build-line>
                    <span className="build-star">*</span>
                    <span className="build-title-copy">
                      Starting build and deployment...
                    </span>
                  </p>
                  <div className="status-row" data-build-line>
                    <span className="status-bullet">•</span>
                    <span className="status-label">
                      Scaffolding app with AppKit
                    </span>
                    <span className="status-leader"></span>
                    <span className="status-value">In progress</span>
                  </div>
                  <div className="status-row" data-build-line>
                    <span className="status-bullet">•</span>
                    <span className="status-label">
                      Provisioning Postgres on Lakebase
                    </span>
                    <span className="status-leader"></span>
                    <span className="status-value">In progress</span>
                  </div>
                  <div className="status-row" data-build-line>
                    <span className="status-bullet">•</span>
                    <span className="status-label">
                      Configuring AI on Agent Bricks
                    </span>
                    <span className="status-leader"></span>
                    <span className="status-value">In progress</span>
                  </div>
                  <div className="status-row" data-build-line>
                    <span className="status-bullet">•</span>
                    <span className="status-label">
                      Deploying app on Databricks Apps
                    </span>
                    <span className="status-leader"></span>
                    <span className="status-value">In progress</span>
                  </div>
                </section>
                <section className="final-status fx-layer" aria-live="polite">
                  <p className="final-done">
                    <span className="final-check" aria-hidden="true">
                      <span className="final-check-mark">✓</span>
                      <span className="final-check-pixels">
                        <span className="final-check-pixel final-check-pixel--top">
                          .
                        </span>
                        <span className="final-check-pixel final-check-pixel--right">
                          .
                        </span>
                        <span className="final-check-pixel final-check-pixel--bottom">
                          .
                        </span>
                        <span className="final-check-pixel final-check-pixel--left">
                          .
                        </span>
                      </span>
                    </span>
                    <span className="final-done-copy">
                      Done - your app is live
                    </span>
                  </p>
                  <p className="final-link">
                    https://sales-overview.databricksapps.com
                  </p>
                  <p
                    id="finalAscii"
                    className="final-ascii"
                    aria-hidden="true"
                  ></p>
                  <p className="final-prompt">
                    &gt;
                    <span className="final-cursor"></span>
                  </p>
                </section>
              </div>
              <section
                id="appPreview"
                className="databricks-app-window app-preview"
                aria-label="Sales overview app preview"
              >
                <div
                  id="appRevealOverlay"
                  className="app-reveal-overlay"
                  aria-hidden="true"
                ></div>
                <Image
                  className="app-prototype-image"
                  src="/img/home/hero/app-prototype.png"
                  alt=""
                  width={1536}
                  height={1028}
                  loading="eager"
                  draggable={false}
                  aria-hidden="true"
                />
                <Image
                  className="app-done-image"
                  src="/img/home/hero/app-done.png"
                  alt=""
                  width={1536}
                  height={1028}
                  loading="eager"
                  draggable={false}
                  aria-hidden="true"
                />
                <div
                  className="app-chart-overlay"
                  aria-hidden="true"
                  aria-label="Revenue vs Target. Monthly actuals compared to quota."
                >
                  <div className="app-chart-head">
                    <div>
                      <h3>Revenue vs Target</h3>
                      <p>Monthly actuals compared to quota</p>
                    </div>
                    <span
                      className="app-chart-toggle"
                      aria-label="Selected range: 12 months"
                    >
                      <span className="app-chart-toggle-label">3M</span>
                      <span className="app-chart-toggle-label">6M</span>
                      <span className="app-chart-toggle-label app-chart-toggle-active">
                        <span>12M</span>
                      </span>
                    </span>
                  </div>
                  <div
                    className="app-chart-stage"
                    role="img"
                    tabIndex={0}
                    aria-label="Line chart comparing monthly revenue to target from January through October."
                  >
                    <div className="app-chart-y-labels" aria-hidden="true">
                      <span>$800K</span>
                      <span>$600K</span>
                      <span>$400K</span>
                      <span>$200K</span>
                      <span>$0K</span>
                    </div>
                    <svg
                      className="app-chart-svg"
                      viewBox="0 0 370 108"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient
                          id="app-chart-revenue-fill"
                          x1="185"
                          y1="0"
                          x2="185"
                          y2="108"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop
                            offset="0.130179"
                            stopColor="#ff5f46"
                            stopOpacity="0.30"
                          ></stop>
                          <stop
                            offset="0.45615"
                            stopColor="#ff5f46"
                            stopOpacity="0.08"
                          ></stop>
                          <stop
                            offset="0.845622"
                            stopColor="#ff5f46"
                            stopOpacity="0"
                          ></stop>
                        </linearGradient>
                      </defs>
                      <path
                        className="app-chart-fill"
                        d="M39.1694 58.05C30.4919 60.75 9.44083 56.925 0 54.675V108H370V0C358.149 4.5 331.192 13.635 318.176 14.175C301.906 14.85 276.596 29.025 266.954 29.025C257.313 29.025 238.029 20.25 230.195 20.25C222.362 20.25 171.743 28.35 165.114 31.05C158.485 33.75 142.215 44.55 135.586 44.55C128.958 44.55 110.277 35.775 104.853 35.775C99.43 35.775 75.3257 36.45 65.0814 39.825C54.8371 43.2 50.0163 54.675 39.1694 58.05Z"
                      ></path>
                      <path
                        className="app-chart-target"
                        d="M0.0429688 67.5588 L369.543 35.7056"
                      ></path>
                      <path
                        className="app-chart-line-live"
                        d="M0 54.675C9.44083 56.925 30.4919 60.75 39.1694 58.05C50.0163 54.675 54.8371 43.2 65.0814 39.825C75.3257 36.45 99.43 35.775 104.853 35.775C110.277 35.775 128.958 44.55 135.586 44.55C142.215 44.55 158.485 33.75 165.114 31.05C171.743 28.35 222.362 20.25 230.195 20.25C238.029 20.25 257.313 29.025 266.954 29.025C276.596 29.025 301.906 14.85 318.176 14.175C331.192 13.635 358.149 4.5 370 0"
                      ></path>
                    </svg>
                    <div className="app-chart-marker">
                      <span className="app-chart-marker-dot is-revenue"></span>
                      <span className="app-chart-marker-dot is-target"></span>
                    </div>
                    <div className="app-chart-hover-card">
                      <b>Jun</b>
                      <span>
                        <i></i>
                        Target:
                        <strong>$390K</strong>
                      </span>
                      <span>
                        <i></i>
                        Revenue:
                        <strong>$520K</strong>
                      </span>
                    </div>
                    <div className="app-chart-months" aria-hidden="true">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Oct</span>
                    </div>
                  </div>
                  <div className="app-chart-foot">
                    <span>
                      Period Revenue
                      <b>$5.43M</b>
                    </span>
                    <span>
                      Period Target
                      <b>$4.81M</b>
                    </span>
                    <span>
                      Attainment
                      <b>113.0%</b>
                    </span>
                  </div>
                </div>
                <div className="app-window-bar">
                  <div className="window-dots" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="address-bar">
                    https://sales-overview.databricksapps.com
                  </div>
                </div>
                <div className="app-window-body">
                  <nav className="app-sidebar" aria-label="App sections">
                    <span className="sidebar-mark">
                      <span className="app-glyph" aria-hidden="true"></span>
                    </span>
                    <span>♧</span>
                    <span>◇</span>
                    <span>▤</span>
                    <span>⌘</span>
                    <span>✣</span>
                  </nav>
                  <div className="app-content">
                    <header className="app-header">
                      <h2>Sales Overview</h2>
                      <p>Full year performance at a glance</p>
                    </header>
                    <div className="metric-grid">
                      <article className="metric-card is-primary">
                        <span className="metric-icon">$</span>
                        <span className="metric-change">▲ 9.8%</span>
                        <p>Total Revenue</p>
                        <strong>$4.94M</strong>
                      </article>
                      <article className="metric-card">
                        <span className="metric-icon">◈</span>
                        <span className="metric-change is-good">▲ 2.3%</span>
                        <p>Quota Attainment</p>
                        <strong>102.3%</strong>
                      </article>
                      <article className="metric-card">
                        <span className="metric-icon">▷</span>
                        <span className="metric-change is-good">▲ 3.1%</span>
                        <p>Win Rate</p>
                        <strong>64.2%</strong>
                      </article>
                      <article className="metric-card">
                        <span className="metric-icon">⌁</span>
                        <span className="metric-change is-bad">▼ 1.8%</span>
                        <p>Avg Deal Size</p>
                        <strong>$42.8K</strong>
                      </article>
                    </div>
                    <div className="dashboard-grid">
                      <article className="chart-panel">
                        <div className="panel-title">
                          <div>
                            <h3>Revenue vs Target</h3>
                            <p>Monthly actuals compared to quota</p>
                          </div>
                          <span>
                            3M  6M
                            <b>12M</b>
                          </span>
                        </div>
                        <div className="chart-area">
                          <div className="chart-y-labels" aria-hidden="true">
                            <span>$800K</span>
                            <span>$600K</span>
                            <span>$400K</span>
                            <span>$200K</span>
                            <span>$0K</span>
                          </div>
                          <div className="chart-months" aria-hidden="true">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                            <span>Jun</span>
                            <span>Jul</span>
                            <span>Aug</span>
                            <span>Sep</span>
                            <span>Oct</span>
                          </div>
                          <div className="chart-line"></div>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "74px", "--y": "83px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "91px", "--y": "89px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "108px", "--y": "87px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "125px", "--y": "74px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "142px", "--y": "61px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "159px", "--y": "58px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "176px", "--y": "57px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "193px", "--y": "62px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "210px", "--y": "71px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "227px", "--y": "69px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "244px", "--y": "62px" })}
                          ></span>
                          <span
                            className="chart-dot dot-a"
                            style={cssVars({ "--x": "261px", "--y": "54px" })}
                          ></span>
                          <span
                            className="chart-dot dot-b"
                            style={cssVars({ "--x": "278px", "--y": "42px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "295px", "--y": "44px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "312px", "--y": "49px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "329px", "--y": "45px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "346px", "--y": "39px" })}
                          ></span>
                          <span
                            className="chart-dot"
                            style={cssVars({ "--x": "363px", "--y": "33px" })}
                          ></span>
                          <div className="chart-tooltip">
                            <b>May</b>
                            <span>Target: $450K</span>
                            <span>Revenue: $467K</span>
                          </div>
                        </div>
                        <div className="chart-footer">
                          <span>
                            Period Revenue
                            <b>$5.43M</b>
                          </span>
                          <span>
                            Period Target
                            <b>$4.81M</b>
                          </span>
                          <span>
                            Attainment
                            <b>113.0%</b>
                          </span>
                        </div>
                      </article>
                      <article className="region-panel">
                        <h3>Revenue by Region</h3>
                        <p>YTD contribution</p>
                        <div className="region-row">
                          <span>North America</span>
                          <b>
                            <em>+12.4%</em>
                            $1.82M
                          </b>
                          <i style={cssVars({ "--bar": "40%" })}></i>
                          <small>38.4%</small>
                        </div>
                        <div className="region-row">
                          <span>Europe</span>
                          <b>
                            <em>+8.7%</em>
                            $1.24M
                          </b>
                          <i style={cssVars({ "--bar": "31%" })}></i>
                          <small>26.2%</small>
                        </div>
                        <div className="region-row">
                          <span>North America</span>
                          <b>
                            <em>+21.3%</em>
                            $980K
                          </b>
                          <i style={cssVars({ "--bar": "40%" })}></i>
                          <small>8.9%</small>
                        </div>
                        <div className="region-row">
                          <span>Latin America</span>
                          <b>
                            <em>+31.2%</em>
                            $270K
                          </b>
                          <i style={cssVars({ "--bar": "40%" })}></i>
                          <small>3.4%</small>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <canvas
              id="gridCanvas"
              className="grid-canvas"
              aria-hidden="true"
            ></canvas>
            <div
              id="rgbGridOverlay"
              className="rgb-grid-overlay"
              aria-hidden="true"
            ></div>
            <div
              id="shadeMapOverlay"
              className="shade-map-overlay"
              aria-hidden="true"
            ></div>
            <div
              id="screenVignette"
              className="screen-vignette"
              aria-hidden="true"
            ></div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function DbHeroAnimation({ className }: DbHeroAnimationProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const playerCleanupRef = useRef<(() => void) | null>(null);
  const playerScriptSrc = `${playerScriptPath}?v=${playerScriptVersion}`;

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const player = (window as DbHeroPlayerWindow).DatabricksHeroPlayer;

    if (player) {
      playerCleanupRef.current = player.mount(root);
    }

    let frame = 0;
    const queueViewportDispatch = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        dispatchViewportState(root);
      });
    };

    const observer = new IntersectionObserver(([entry]) => {
      window.dispatchEvent(
        new CustomEvent("db-hero-viewport-change", {
          detail: {
            isInViewport: entry.isIntersecting,
          },
        }),
      );
    });

    observer.observe(root);
    dispatchViewportState(root);
    window.addEventListener("scroll", queueViewportDispatch, { passive: true });
    window.addEventListener("resize", queueViewportDispatch);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      observer.disconnect();
      window.removeEventListener("scroll", queueViewportDispatch);
      window.removeEventListener("resize", queueViewportDispatch);
      playerCleanupRef.current?.();
      playerCleanupRef.current = null;
    };
  }, []);

  return (
    <>
      <Script
        id="db-hero-player-script"
        src={playerScriptSrc}
        strategy="afterInteractive"
        onReady={() => {
          const root = rootRef.current;

          if (!root) {
            return;
          }

          if (!playerCleanupRef.current) {
            playerCleanupRef.current =
              (window as DbHeroPlayerWindow).DatabricksHeroPlayer?.mount(
                root,
              ) ?? null;
          }

          dispatchViewportState(root);
        }}
      />
      <div
        ref={rootRef}
        className={cn(
          "db-hero-animation-root is-export-player absolute inset-0 h-full w-full",
          className,
        )}
        aria-hidden="true"
      >
        <DbHeroPlayerScene />
      </div>
    </>
  );
}
