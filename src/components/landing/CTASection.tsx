import { ArrowRightOutlined, RocketOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const EASE = [0.22, 1, 0.36, 1] as const;

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="cc-section cc-section--dark landing-dark-bg">
      <div className="cc-grid cc-grid--dark" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="cc-orb cc-animate-float-c left-1/4 top-1/3 h-64 w-64 bg-brand-300/6"
      />
      <div
        aria-hidden="true"
        className="cc-orb cc-animate-float-a right-1/4 bottom-0 h-64 w-64 bg-brand-400/10"
      />

      <div className="cc-container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="cc-eyebrow cc-eyebrow--onDark">
            <RocketOutlined />
            Start today
          </span>

          <h2 className="cc-display mt-6 text-white">
            Ready to transform{" "}
            <span className="cc-gradient-text--onDark">your campus?</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brand-100/75">
            Join the students, faculty and administrators already running campus
            operations in one place.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/register")}
              className="cc-btn cc-btn--lg group bg-white text-brand-900 shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:bg-brand-50"
            >
              Get started free
              <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="cc-btn cc-btn-onDark cc-btn--lg"
            >
              Sign in
            </button>
          </div>

          <p className="mt-6 text-sm text-brand-100/55">
            Free for your institution to trial · No card required
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
