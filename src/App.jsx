import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useSpring } from "framer-motion";
import * as D from "./data";
import Chat from "./Chat";

const Reveal = ({ children, delay = 0, className }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}>{children}</motion.div>
);

function Count({ to, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <strong ref={ref}>{n}{suffix}</strong>;
}

function Typed({ words }) {
  const [t, setT] = useState("");
  useEffect(() => {
    let w = 0, c = 0, del = false, id;
    const tick = () => {
      const word = words[w];
      c += del ? -1 : 1; setT(word.slice(0, c));
      let d = del ? 40 : 85;
      if (!del && c === word.length) { del = true; d = 1400; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; d = 300; }
      id = setTimeout(tick, d);
    };
    tick();
    return () => clearTimeout(id);
  }, [words]);
  return <b>{t}<span className="cur" /></b>;
}

function Pipeline() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((x) => (x + 1) % (D.pipeline.length + 1)), 1200); return () => clearInterval(id); }, []);
  return (
    <motion.div className="pipe" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
      <div className="pbar"><i /><i /><i /><span>rag-pipeline.run</span></div>
      {D.pipeline.map(([b, s], k) => (
        <div key={b} className={"st" + (k === i ? " on" : "") + (k < i ? " done" : "")}>
          <span className="d" /><div><b>{b}</b><small>{s}</small></div>
        </div>
      ))}
    </motion.div>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const rise = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] } } };

export default function App() {
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const prog = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const all = D.skills.flatMap(([, s]) => s);

  return (
    <>
      <motion.div className="progress" style={{ scaleX: prog }} />
      <header><div className="wrap nav">
        <a className="logo" href="#top">Aman Puskar</a>
        <ul>{[["about", "About"], ["build", "GenAI"], ["experience", "Experience"], ["skills", "Skills"], ["projects", "Projects"]].map(([h, l]) => <li key={h}><a href={"#" + h}>{l}</a></li>)}</ul>
        <button className="nbtn" onClick={() => setOpen(true)}>Ask my AI</button>
      </div></header>

      <main id="top">
        <section className="hero"><div className="blob b1" /><div className="blob b2" />
          <div className="wrap hgrid">
            <motion.div variants={stagger} initial="hidden" animate="show">
              <motion.div variants={rise} className="tag"><i />Open to GenAI and LLM engineering roles</motion.div>
              <motion.h1 variants={rise}>Aman Puskar<em>GenAI and RAG engineer</em></motion.h1>
              <motion.div variants={rise} className="rule" />
              <motion.div variants={rise} className="role">Building with <Typed words={D.roles} /></motion.div>
              <motion.p variants={rise} className="lead">I build LLM-powered products: retrieval-augmented systems, agentic workflows and AI assistants that replace manual document work, then ship them end to end with FastAPI, React and Spring Boot.</motion.p>
              <motion.div variants={rise} className="cta">
                <button className="btn g" onClick={() => setOpen(true)}>Chat with my AI</button>
                <a className="btn" href="#projects">Try project demos</a>
                <a className="btn" href={D.links.github} target="_blank" rel="noreferrer">GitHub</a>
              </motion.div>
            </motion.div>
            <Pipeline />
          </div>
        </section>

        <div className="marq"><div className="track">{[...all, ...all].map((s, i) => <span className="chip" key={i}>{s}</span>)}</div></div>

        <section id="about"><div className="wrap">
          <Reveal><h2>About</h2><p className="sub">GenAI engineer who builds RAG pipelines, agentic apps and LLM-powered tools, backed by a strong DSA foundation. I work in Python, FastAPI, React and Spring Boot, and pick up new AI platforms quickly.</p></Reveal>
          <Reveal className="stats">{D.stats.map(([n, s, l]) => <div className="stat" key={l}><Count to={n} suffix={s} /><span>{l}</span></div>)}</Reveal>
        </div></section>

        <section id="build"><div className="wrap">
          <Reveal><h2>What I build with GenAI</h2><p className="sub">Making language models useful, accurate and grounded in real data.</p></Reveal>
          <div className="grid">{D.build.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.1}><motion.div className="box" whileHover={{ y: -6, borderColor: "#2ee6d680" }}><h3>{t}</h3><p>{d}</p></motion.div></Reveal>))}</div>
        </div></section>

        <section id="experience"><div className="wrap">
          <Reveal><h2>Experience</h2></Reveal>
          <Reveal className="job"><div className="when">Internship</div>
            <div><h3>{D.job.title}</h3><div className="co">{D.job.company}</div>
              <ul>{D.job.points.map((p) => <li key={p}>{p}</li>)}</ul></div></Reveal>
        </div></section>

        <section id="skills"><div className="wrap">
          <Reveal><h2>Skills</h2></Reveal>
          {D.skills.map(([t, items]) => (
            <Reveal className="sk" key={t}><h3>{t}</h3><div>{items.map((s) => <span className="chip" key={s}>{s}</span>)}</div></Reveal>))}
        </div></section>

        <section id="projects"><div className="wrap">
          <Reveal><h2>Projects</h2><p className="sub">Explore each project live or visit its source.</p></Reveal>
          <div className="grid">{D.projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.12}><motion.article className="proj" whileHover={{ y: -8 }}>
              <h3>{p.title}</h3><p>{p.desc}</p>
              <div>{p.tags.map((t) => <span className="chip sm" key={t}>{t}</span>)}</div>
              <div className="pbtns"><a className="btn g sm" href={p.demo} target="_blank" rel="noreferrer">Live demo</a>
                <a className="btn sm" href={p.repo} target="_blank" rel="noreferrer">Source</a></div>
            </motion.article></Reveal>))}</div>
        </div></section>

        <section><div className="wrap grid2">
          <Reveal className="box"><h3>Certifications</h3><ul className="list">{D.certs.map((c) => <li key={c}>{c}</li>)}</ul></Reveal>
          <Reveal className="box" delay={0.1}><h3>Achievements</h3><ul className="list">{D.wins.map((c) => <li key={c}>{c}</li>)}</ul></Reveal>
        </div></section>

        <section id="contact" className="contact"><div className="wrap">
          <Reveal><h2>Let’s build something intelligent together.</h2>
            <p className="sub">B.Tech, NIET Greater Noida, class of 2026. Reach out about GenAI, LLM or full-stack roles.</p>
            <div className="cta c"><a className="btn g" href={"mailto:" + D.links.email}>Email me</a>
              <a className="btn" href={"tel:" + D.links.phone.replace(/\s/g, "")}>{D.links.phone}</a>
              <a className="btn" href={D.links.github} target="_blank" rel="noreferrer">GitHub</a>
              <a className="btn" href={D.links.leetcode} target="_blank" rel="noreferrer">LeetCode</a></div></Reveal>
        </div></section>
      </main>
      <footer>© 2026 Aman Puskar</footer>

      <Chat open={open} setOpen={setOpen} />
    </>
  );
}
