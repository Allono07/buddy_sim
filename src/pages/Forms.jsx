import { useState } from "react";
import { ArrowUpRight, MessageSquare, Leaf } from "lucide-react";
function SubmissionForm({ story = false }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setStatus("");
    if (story) {
      data.append(
        "submitted_at",
        new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      );
      data.append("source_page", "/yourstory");
      data.append(
        "service_id",
        import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_z7ejjbn",
      );
      data.append(
        "template_id",
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_2kpywxj",
      );
      data.append(
        "user_id",
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "noyxT_Bu6ph2s9LL8",
      );
    }
    try {
      const res = await fetch(
        story
          ? "https://api.emailjs.com/api/v1.0/email/send-form"
          : "https://formspree.io/f/xeepnpeo",
        {
          method: "POST",
          body: data,
          headers: story ? {} : { Accept: "application/json" },
        },
      );
      if (!res.ok) throw Error();
      setStatus(
        story
          ? "Thanks for taking the time to share your experience. Your report has been sent successfully."
          : "Thanks for reaching out. Your message has been sent successfully.",
      );
      form.reset();
    } catch {
      setStatus(
        story
          ? "Could not send your report right now. Please try again in a moment."
          : "Could not send your message right now. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="public-form">
      {story ? (
        <>
          <label className="field">
            Area / Location
            <input
              name="area"
              placeholder="Enter your locality"
              autoComplete="address-level2"
              required
            />
          </label>
          <label className="field">
            Problem Description
            <textarea
              name="description"
              rows="6"
              placeholder="Describe how you are currently experiencing the waste collection service and what issues you are facing"
              required
            />
          </label>
          <label className="field">
            Email (Optional)
            <input
              name="email"
              type="email"
              placeholder="you@trashbuddy.in"
              autoComplete="email"
            />
          </label>
        </>
      ) : (
        <>
          <label className="field">
            Your name
            <input
              name="name"
              placeholder="Enter your name"
              autoComplete="name"
              required
            />
          </label>
          <label className="field">
            Your email
            <input
              name="email"
              type="email"
              placeholder="you@trashbuddy.in"
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            Your message
            <textarea
              name="message"
              rows="7"
              placeholder="Tell us how we can help"
              required
            />
          </label>
        </>
      )}
      <button className="button primary full" disabled={busy}>
        {busy ? "Sending..." : story ? "Submit Problem" : "Send Message"}
        <ArrowUpRight size={18} />
      </button>
      <p role="status">{status}</p>
    </form>
  );
}
export function Contact() {
  return (
    <main className="form-page section">
      <div>
        <span className="eyebrow">CONTACT</span>
        <h1>Let’s talk.</h1>
        <div className="contact-note">
          <MessageSquare />
          <h2>Product feedback</h2>
          <p>Tell us what should improve in the overall experience.</p>
        </div>
        <div className="contact-note">
          <Leaf />
          <h2>Partnerships or pilots</h2>
          <p>
            Reach out if you want to discuss collaborations, pilots, or a Trash
            Buddy walkthrough.
          </p>
        </div>
        <a className="text-link" href="mailto:contact@trashbuddy.in">
          contact@trashbuddy.in <ArrowUpRight size={16} />
        </a>
      </div>
      <SubmissionForm />
    </main>
  );
}
export function Story() {
  return (
    <main className="story-page section">
      <div className="story-copy">
        <span className="eyebrow">YOUR STORY MATTERS</span>
        <h1>
          Facing a<br />
          similar problem?
        </h1>
        <p>Tell us what you're facing.</p>
        <div className="story-pictures">
          {[
            [
              "trucknotarrived",
              "trucnotarrivedmobile",
              "A resident waiting for waste collection",
            ],
            ["missedalert", "unawaremobile", "A missed waste collection alert"],
            [
              "illegaldumping",
              "illegalmobile",
              "Waste dumped in a neighbourhood",
            ],
          ].map(([file, mobile, alt]) => (
            <picture key={file}>
              <source
                media="(max-width: 600px)"
                srcSet={`/assets/images/${mobile}.webp`}
              />
              <img
                src={`/assets/images/${file}.webp`}
                alt={alt}
                loading="lazy"
              />
            </picture>
          ))}
        </div>
      </div>
      <SubmissionForm story />
    </main>
  );
}
