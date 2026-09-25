import React, { Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Moon, Sun, ArrowUpRight, Menu, X } from "lucide-react";
import { ThemeProvider, useTheme } from "./Theme";
import Home from "./pages/Home";
import { metadata } from "./metadata";
import "./styles.css";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Contact = lazy(() =>
  import("./pages/Forms").then((m) => ({ default: m.Contact })),
);
const Story = lazy(() =>
  import("./pages/Forms").then((m) => ({ default: m.Story })),
);
function Header() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <img
          src="/assets/images/trash_buddy.png"
          alt="Trash Buddy logo"
          width="38"
          height="38"
        />
        <span>
          trash<span className="brand-light">buddy</span>
          <span className="brand-dot">.</span>
        </span>
      </Link>
      <nav aria-label="Primary" className={open ? "site-nav open" : "site-nav"}>
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/yourstory">Your Story</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <a
          className="founder"
          href="https://allenthomson.com"
          target="_blank"
          rel="noreferrer"
        >
          Meet the founding engineer <ArrowUpRight size={14} />
        </a>
      </nav>
      <div className="header-actions">
        <button
          className="icon-button theme-toggle"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          onClick={toggle}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Link className="button primary nav-cta" to="/simulationdashboard">
          Try the simulation <ArrowUpRight size={16} />
        </Link>
        <button
          className="icon-button mobile-menu"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer>
      <Link to="/" className="footer-brand">
        trashbuddy.
      </Link>
      <span>@allenthomson.com / contact@trashbuddy.in</span>
      <div>
        <a
          href="https://www.instagram.com/trashbuddy.in/"
          target="_blank"
          rel="noreferrer"
        >
          Follow us on Instagram <ArrowUpRight size={13} />
        </a>
        <a href="https://allenthomson.com" target="_blank" rel="noreferrer">
          Portfolio
        </a>
        <Link to="/contact">Contact</Link>
      </div>
    </footer>
  );
}
function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = metadata[pathname.replace(/\/$/, "") || "/"];
    if (meta) {
      document.title = meta[0];
      document.querySelector('meta[name="description"]').content = meta[1];
    }
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <Header />
      <div id="content">
        <Suspense
          fallback={
            <div className="loading" role="status">
              Getting things ready…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulationdashboard" element={<Dashboard />} />
            <Route
              path="/simulation"
              element={<Navigate replace to="/simulationdashboard" />}
            />
            <Route path="/yourstory" element={<Story />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="*"
              element={
                <main className="section">
                  <h1>Page not found</h1>
                  <Link className="button" to="/">
                    Back home
                  </Link>
                </main>
              }
            />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MotionConfig>
    </ThemeProvider>
  </React.StrictMode>,
);
