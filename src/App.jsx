import React, { useMemo, useRef, useState, useEffect } from "react";
import { mediaItems } from "./mediaData"; // keep unchanged

const UNIVERSE_FILTERS = [
  "All",
  "Marvel",
  "Sony",
  "X-Men",
  "DC",
  "Star Wars",
  "Indiana Jones",
  "Other",
];

const UNIVERSE_DEFAULTS = {
  Marvel: {
    rating: 8.0,
    cast: [
      "Robert Downey Jr.",
      "Chris Evans",
      "Scarlett Johansson",
      "Chris Hemsworth",
    ],
    streaming: ["Disney+", "Prime Video (rental)"],
  },
  "X-Men": {
    rating: 7.7,
    cast: ["Hugh Jackman", "Patrick Stewart", "Ian McKellen"],
    streaming: ["Disney+", "Prime Video (rental)"],
  },
  Sony: {
    rating: 7.5,
    cast: ["Tobey Maguire", "Andrew Garfield", "Tom Hardy"],
    streaming: ["Netflix (varies)", "Prime Video (rental)"],
  },
  DC: {
    rating: 7.6,
    cast: ["Henry Cavill", "Gal Gadot", "Ben Affleck", "Jason Momoa"],
    streaming: ["Max", "Prime Video (rental)"],
  },
  "Star Wars": {
    rating: 8.3,
    cast: ["Mark Hamill", "Harrison Ford", "Carrie Fisher"],
    streaming: ["Disney+"],
  },
  "Indiana Jones": {
    rating: 8.1,
    cast: ["Harrison Ford", "Karen Allen"],
    streaming: ["Disney+", "Paramount+ (varies)"],
  },
  Other: {
    rating: 7.5,
    cast: ["Main franchise cast"],
    streaming: ["Disney+", "Max", "Netflix", "Prime Video"],
  },
};

function getUniverseKey(universe) {
  if (!universe) return "Other";
  if (universe === "MCU") return "Marvel";
  return universe;
}

function getDisplayRating(item) {
  const uniKey = getUniverseKey(item.universe || item.category);
  const defaults = UNIVERSE_DEFAULTS[uniKey] || UNIVERSE_DEFAULTS.Other;
  if (typeof item.rating === "number") return item.rating.toFixed(1);
  if (typeof defaults.rating === "number") return defaults.rating.toFixed(1);
  return "NR";
}

function buildDetails(item) {
  const uniKey = getUniverseKey(item.universe || item.category);
  const defaults = UNIVERSE_DEFAULTS[uniKey] || UNIVERSE_DEFAULTS.Other;

  const rating =
    typeof item.rating === "number"
      ? item.rating
      : typeof defaults.rating === "number"
      ? defaults.rating
      : 7.5;

  const genresArray =
    Array.isArray(item.genres) && item.genres.length ? item.genres : [];
  const genresText = genresArray.length
    ? genresArray.join(" / ")
    : "Action / Adventure";

  const plot =
    item.plot ||
    `${item.title} is a ${item.year || "modern"} ${(
      item.type || "story"
    ).toLowerCase()} set in the ${uniKey} corner of the multiverse, mixing ${genresText.toLowerCase()} with character-driven comic-book storytelling.`;

  const castList =
    Array.isArray(item.cast) && item.cast.length
      ? item.cast
      : defaults.cast || [];

  const streamingList =
    Array.isArray(item.streaming) && item.streaming.length
      ? item.streaming
      : defaults.streaming || [];

  return { rating, genresText, plot, castList, streamingList, uniKey };
}

/* ------------------------------------------------------------------ */
/*  BACKGROUND GRID – Netflix-style looping wallpaper                 */
/* ------------------------------------------------------------------ */

function BackgroundGrid({ items, animated }) {
  if (!items || !items.length) return null;

  // HOME: animated infinite loop using two copies side-by-side
  if (animated) {
    return (
      <div className="bg-poster-grid-wrapper">
        <div className="bg-poster-track animated">
          {[0, 1].map((rep) => (
            <div className="bg-poster-grid" key={rep}>
              {items.map((item, index) => {
                const key = item.id || `${item.title}-${index}-${rep}`;
                return (
                  <div className="bg-poster-tile" key={key}>
                    {item.poster && (
                      <img
                        src={item.poster}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // BROWSE: same collage but static
  return (
    <div className="bg-poster-grid-wrapper">
      <div className="bg-poster-grid bg-poster-static">
        {items.map((item, index) => {
          const key = item.id || `${item.title}-${index}`;
          return (
            <div className="bg-poster-tile" key={key}>
              {item.poster && (
                <img
                  src={item.poster}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HORIZONTAL SECTIONS (HOME)                                        */
/* ------------------------------------------------------------------ */

function Section({ title, subtitle, items, onCardClick }) {
  const rowRef = useRef(null);

  const scrollRow = (direction) => {
    const node = rowRef.current;
    if (!node) return;
    const amount = node.clientWidth * 0.8;
    node.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <div className="section-controls">
          <button
            type="button"
            className="scroll-btn"
            onClick={() => scrollRow("left")}
          >
            ‹
          </button>
          <button
            type="button"
            className="scroll-btn"
            onClick={() => scrollRow("right")}
          >
            ›
          </button>
        </div>
      </div>
      <div className="row-wrapper">
        <div className="card-row" ref={rowRef}>
          {items.map((item, index) => {
            const key = item.id || `${item.title}-${item.year}-${index}`;
            return (
              <article
                key={key}
                className="media-card"
                onClick={() => onCardClick(item)}
              >
                <div className="media-card-inner">
                  <div className="media-tag-row">
                    <span className="badge badge-universe">
                      {item.universe || item.category || "Other"}
                    </span>
                    <span className="badge badge-rating">
                      ★ {getDisplayRating(item)}
                    </span>
                  </div>
                  <div className="media-image">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="media-image-placeholder">
                        {item.title}
                      </div>
                    )}
                  </div>
                  <h3 className="media-title">{item.title}</h3>
                  <p className="media-meta">
                    {item.year && <span>{item.year}</span>}
                    <span className="dot">•</span>
                    <span>{item.genre || "Action / Adventure"}</span>
                    <span className="dot">•</span>
                    <span>{item.category || "Title"}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  BROWSE MODE – POSTER GRID                                         */
/* ------------------------------------------------------------------ */

function BrowsePosterGrid({ items, onCardClick }) {
  if (!items.length) {
    return (
      <p style={{ marginTop: 24, color: "#a3b0d4", fontSize: 14 }}>
        No titles match your filters yet.
      </p>
    );
  }

  return (
    <div className="browse-grid">
      {items.map((item, index) => {
        const key = item.id || `${item.title}-${item.year}-${index}`;
        return (
          <button
            key={key}
            className="browse-poster-card"
            type="button"
            onClick={() => onCardClick(item)}
          >
            <div className="browse-poster-img">
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="browse-poster-placeholder">{item.title}</div>
              )}
            </div>
            <div className="browse-poster-caption">
              <span className="browse-poster-title" title={item.title}>
                {item.title}
              </span>
              {item.year && (
                <span className="browse-poster-year">{item.year}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DETAIL PANEL                                                       */
/* ------------------------------------------------------------------ */

function DetailPanel({ item, onClose }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [item]);

  // ESC to close
  useEffect(() => {
    if (!item) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [item, onClose]);

  if (!item) return null;

  const { rating, genresText, plot, castList, streamingList, uniKey } =
    buildDetails(item);

  return (
    <div
      className="detail-backdrop"
      style={{
        backgroundImage: item?.poster
          ? `linear-gradient(
              to bottom,
              rgba(3,7,18,0.35) 0%,
              rgba(3,7,18,0.75) 45%,
              rgba(3,7,18,0.98) 100%
            ),
            url('${item.poster}')`
          : undefined,
      }}
      onClick={onClose}
    >
      <div
        className={`detail-panel flip-card${flipped ? " flipped" : ""}`}
        style={{ position: "relative", zIndex: 2 }}
        onClick={(e) => {
          e.stopPropagation();
          setFlipped((f) => !f);
        }}
      >
        <div className="flip-card-inner">
          {/* FRONT */}
          <div className="flip-card-front">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: "36px 36px 24px",
              }}
            >
              <div className="detail-poster" style={{ marginBottom: 20 }}>
                {item.poster ? (
                  <img src={item.poster} alt={item.title} />
                ) : (
                  <div className="detail-poster-placeholder">
                    {item.title}
                  </div>
                )}
              </div>
              <h2
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 30,
                  letterSpacing: "1px",
                  margin: 0,
                  textShadow: "0 4px 18px #0008",
                }}
              >
                {item.title}
              </h2>
              <div
                style={{
                  color: "#bbb",
                  fontSize: 18,
                  paddingTop: 4,
                  fontWeight: 400,
                }}
              >
                {item.year ? item.year : ""}
              </div>
              <div
                style={{
                  color: "#eee",
                  fontSize: 15,
                  paddingTop: 5,
                }}
              >
                ▼ Click to flip for details
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="flip-card-back">
            <button
              type="button"
              className="detail-close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="detail-main">
              <div className="detail-poster">
                {item.poster ? (
                  <img src={item.poster} alt={item.title} />
                ) : (
                  <div className="detail-poster-placeholder">
                    {item.title}
                  </div>
                )}
              </div>
              <div className="detail-body">
                <p className="detail-kicker">
                  {(item.category || "Title").toUpperCase()} ·{" "}
                  {uniKey.toUpperCase()}
                </p>
                <h2 className="detail-title">{item.title}</h2>
                <p className="detail-meta">
                  {item.year && <span>Release: {item.year}</span>}
                  <span className="dot">•</span>
                  <span>Genre: {genresText}</span>
                  <span className="dot">•</span>
                  <span>Rating: ★ {rating.toFixed(1)}</span>
                </p>
                <p className="detail-plot">{plot}</p>
                <div className="detail-grid">
                  <div className="detail-block">
                    <h3>Main cast</h3>
                    {castList.length ? (
                      <p>{castList.join(", ")}</p>
                    ) : (
                      <p>
                        Cast info not set yet – you can add a{" "}
                        <code>cast: [&quot;Actor 1&quot;, ...]</code> array in{" "}
                        <code>mediaData.js</code> for this title.
                      </p>
                    )}
                  </div>
                  <div className="detail-block">
                    <h3>Where to stream</h3>
                    {streamingList.length ? (
                      <ul className="detail-streaming-list">
                        {streamingList.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>
                        Add a <code>streaming</code> array (e.g.{" "}
                        <code>["Disney+","Netflix"]</code>) in{" "}
                        <code>mediaData.js</code> to show specific platforms.
                      </p>
                    )}
                  </div>
                </div>
                <div className="detail-actions">
                  <button type="button" className="primary-btn">
                    Queue for tonight
                  </button>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={onClose}
                  >
                    Close panel
                  </button>
                </div>
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                color: "#ddd",
                fontSize: 15,
                padding: "14px 0 0",
              }}
            >
              ◄ Click to flip back
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN APP                                                           */
/* ------------------------------------------------------------------ */

function App() {
  const [mode, setMode] = useState("home"); // 'home' | 'browse'
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [gridSeed, setGridSeed] = useState(0);
  const [browseKind, setBrowseKind] = useState("all"); // all | movie | series

  // Disable background scroll when detail open
  useEffect(() => {
    if (selected) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [selected]);

  // Random unique posters for wallpaper grid
  const backgroundPosters = useMemo(() => {
    const list = Array.isArray(mediaItems) ? mediaItems : [];
    const posters = list.filter((i) => i.poster);
    const shuffled = [...posters].sort(() => Math.random() - 0.5);
    const maxTiles = Math.min(40, shuffled.length);
    return shuffled.slice(0, maxTiles);
  }, [gridSeed]);

  // Shared filtered list (universe + search)
  const filtered = useMemo(() => {
    const list = Array.isArray(mediaItems) ? mediaItems : [];
    const q = search.trim().toLowerCase();

    return list
      .filter((item) => {
        if (filter === "All") return true;
        const universe = (item.universe || item.category || "Other").toString();
        if (filter === "Other") {
          const known = [
            "Marvel",
            "Sony",
            "X-Men",
            "DC",
            "Star Wars",
            "Indiana Jones",
          ];
          return !known.includes(universe);
        }
        return universe === filter;
      })
      .filter((item) => {
        if (!q) return true;
        const title = (item.title || "").toLowerCase();
        const uni = (item.universe || "").toLowerCase();
        const cat = (item.category || "").toLowerCase();
        return title.includes(q) || uni.includes(q) || cat.includes(q);
      })
      .sort((a, b) => {
        const ya = a.year || 0;
        const yb = b.year || 0;
        return ya - yb;
      });
  }, [filter, search]);

  const movies = filtered.filter((i) => (i.category || "movie") === "movie");
  const series = filtered.filter((i) => (i.category || "movie") === "series");

  const handleCloseDetail = () => {
    setSelected(null);
    setGridSeed((s) => s + 1); // new random wallpaper after closing
  };

  const handleUniverseClick = (u) => {
    if (u === "All") {
      // acts like home: reset filters + search
      setFilter("All");
      setSearch("");
      setMode("home");
      setBrowseKind("all");
    } else {
      setFilter(u);
    }
  };

  // Browse-mode list with extra movie/series filter
  const browseItems = useMemo(() => {
    if (browseKind === "movie") {
      return filtered.filter((i) => (i.category || "movie") === "movie");
    }
    if (browseKind === "series") {
      return filtered.filter((i) => (i.category || "movie") === "series");
    }
    return filtered;
  }, [filtered, browseKind]);

  const isHome = mode === "home";
  const isBrowse = mode === "browse";

  return (
    <div className="app-root">
      {/* Netflix-style wallpaper */}
      <BackgroundGrid items={backgroundPosters} animated={isHome} />

      <div className="app-shell">
        {/* Top bar */}
        <header className="top-bar">
          <div>
            <h1 className="app-title">Multiverse Watchboard</h1>
            <p className="app-subtitle">
              Browse every major Marvel, DC, Sony, Star Wars &amp; Indiana Jones
              title. Tap a card for full details.
            </p>
          </div>

          <div className="top-bar-right">
            <div className="search-wrapper">
              <input
                className="search-input"
                type="text"
                placeholder="Search movies & series by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              className={
                "browse-toggle-btn" + (isBrowse ? " browse-toggle-active" : "")
              }
              onClick={() => setMode(isBrowse ? "home" : "browse")}
            >
              {isBrowse ? "Home" : "Browse"}
            </button>
          </div>
        </header>

        {/* Browse-mode filters */}
        {isBrowse && (
          <div className="browse-topbar">
            <div className="browse-kind-filters">
              <button
                type="button"
                className={
                  "browse-kind-chip" +
                  (browseKind === "all" ? " browse-kind-chip-active" : "")
                }
                onClick={() => setBrowseKind("all")}
              >
                All titles
              </button>
              <button
                type="button"
                className={
                  "browse-kind-chip" +
                  (browseKind === "movie" ? " browse-kind-chip-active" : "")
                }
                onClick={() => setBrowseKind("movie")}
              >
                Movies
              </button>
              <button
                type="button"
                className={
                  "browse-kind-chip" +
                  (browseKind === "series" ? " browse-kind-chip-active" : "")
                }
                onClick={() => setBrowseKind("series")}
              >
                Series
              </button>
            </div>
          </div>
        )}

        {/* Universe filters */}
        <div className="filter-row">
          {UNIVERSE_FILTERS.map((u) => (
            <button
              key={u}
              type="button"
              className={
                "filter-chip" + (filter === u ? " filter-chip-active" : "")
              }
              onClick={() => handleUniverseClick(u)}
            >
              {u}
            </button>
          ))}
        </div>

        <main className="main-content">
          {isHome && (
            <>
              <Section
                title="Movies"
                subtitle="All films from the universes you picked, in chronological order."
                items={movies}
                onCardClick={setSelected}
              />
              <Section
                title="Series"
                subtitle="All shows & animated series from those universes."
                items={series}
                onCardClick={setSelected}
              />
            </>
          )}

          {isBrowse && (
            <section className="section">
              <div className="section-header">
                <div>
                  <h2 className="section-title">Browse all titles</h2>
                  <p className="section-subtitle">
                    Vertical poster grid with everything that matches your
                    filters.
                  </p>
                </div>
              </div>
              <BrowsePosterGrid items={browseItems} onCardClick={setSelected} />
            </section>
          )}
        </main>
      </div>

      <DetailPanel item={selected} onClose={handleCloseDetail} />
    </div>
  );
}

export default App;
