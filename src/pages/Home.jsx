import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Radio,
  Leaf,
} from "lucide-react";
import Bin from "../components/Bin";
export default function Home() {
  const [slide, setSlide] = useState(0);
  const reduced = useReducedMotion();
  return (
    <>
      <section className="hero">
        <div className="eyebrow">
          <span className="live-dot" /> A LITTLE SMARTER. A LOT CLEANER.
        </div>
        <div className="wordmark">
          <motion.h1
            initial={{ opacity: 0, y: reduced ? 0 : 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span>Trash</span>
            <span>Buddy</span>
          </motion.h1>
          <Bin />
        </div>
        <div className="hero-bottom">
          <div className="hero-caption">
            <Leaf size={18} />
            <span>
              Be a smarter citizen.
              <br />
              <strong>Make room for a cleaner tomorrow.</strong>
            </span>
          </div>
          <div className="hero-intro">
            <p>A live BBMP waste truck tracker/alert application</p>
            <Link className="button primary" to="/simulationdashboard">
              Open Simulation Dashboard <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="location-tag">
            <MapPin size={16} /> MADE FOR BENGALURU
          </div>
        </div>
      </section>
      <div className="feature-strip">
        <span>
          <Radio size={17} /> Live truck tracking
        </span>
        <span>
          <MapPin size={17} /> Right at your doorstep
        </span>
        <span>
          <Leaf size={17} /> A cleaner neighbourhood
        </span>
      </div>
      <section className="section solve">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE EVERYDAY PROBLEM</span>
            <h2>What are we trying to solve</h2>
          </div>
          <Link className="text-link" to="/yourstory">
            Share your problem with us! <ArrowUpRight size={17} />
          </Link>
        </div>
        <div
          className="slide-frame"
          aria-roledescription="carousel"
          aria-label="What we're solving"
        >
          <img
            src={`/assets/images/${slide + 1}.png`}
            alt={`Trash Buddy original product presentation, slide ${slide + 1} of 4`}
            loading="lazy"
            width="1600"
            height="900"
          />
          <div className="slide-controls">
            <span className="mono">
              0{slide + 1} <span className="muted">/ 04</span>
            </span>
            <div className="dots">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={slide === i ? "true" : undefined}
                  onClick={() => setSlide(i)}
                  className={slide === i ? "selected" : ""}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="icon-button"
                aria-label="Previous slide"
                onClick={() => setSlide((slide + 3) % 4)}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                className="icon-button"
                aria-label="Next slide"
                onClick={() => setSlide((slide + 1) % 4)}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="cta section">
        <span className="eyebrow">SEE IT IN ACTION</span>
        <h2>
          Checkout the live simulation
          <br />
          of Trash Buddy!
        </h2>
        <Link className="button primary" to="/simulationdashboard">
          Open Simulation Dashboard <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
