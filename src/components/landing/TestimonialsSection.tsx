import { StarFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Ankit Sharma',
    role: 'B.Tech CSE, 3rd Year',
    quote: 'CampusCure made it so easy to report the broken projector in our lab. It was fixed within 2 days!',
    initials: 'AS',
    gradient: 'from-blue-600 to-cyan-500',
    rating: 5,
  },
  {
    name: 'Dr. Priya Mehta',
    role: 'Associate Professor, CS Dept',
    quote: 'The doubt community has transformed how students seek help. I can verify answers and ensure quality discussions.',
    initials: 'PM',
    gradient: 'from-violet-600 to-purple-500',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'B.Tech ECE, 2nd Year',
    quote: 'I love the real-time tracking. I always know the status of my complaint without having to chase anyone.',
    initials: 'RV',
    gradient: 'from-green-600 to-emerald-500',
    rating: 4,
  },
  {
    name: 'Prof. Suresh Iyer',
    role: 'Head of Department, ME',
    quote: 'The analytics dashboard gives us clear insights into recurring issues. We reduced complaint resolution time by 40%.',
    initials: 'SI',
    gradient: 'from-orange-500 to-amber-400',
    rating: 5,
  },
  {
    name: 'Sneha Patel',
    role: 'M.Tech IT, 1st Year',
    quote: 'The doubt community is a lifesaver during exam season. Peer answers and faculty verification build real confidence.',
    initials: 'SP',
    gradient: 'from-rose-600 to-pink-500',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Campus Administrator',
    quote: 'Managing hundreds of complaints across departments is now streamlined. The assignment system works perfectly.',
    initials: 'RK',
    gradient: 'from-indigo-600 to-blue-500',
    rating: 4,
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 px-6 bg-muted/20 dark:bg-muted/10">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-600/10 text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Testimonials
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Loved by the{' '}
          <span className="bg-linear-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
            campus community
          </span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          See what students, faculty, and administrators say about CampusCure.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            whileHover={{ y: -5 }}
            className="group rounded-3xl bg-card border border-border p-6 cursor-default flex flex-col hover:shadow-2xl hover:shadow-black/5 transition-all duration-300"
          >
            {/* Large decorative quote */}
            <div className="text-5xl font-serif leading-none text-muted/30 mb-3 select-none">&ldquo;</div>

            <p className="text-sm text-foreground leading-relaxed flex-1 mb-5">{t.quote}</p>

            <div className="flex items-center gap-3 pt-4 border-t border-border/60">
              <div className={`h-10 w-10 rounded-2xl bg-linear-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md`}>
                {t.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground truncate">{t.name}</div>
                <div className="text-xs text-muted-foreground truncate">{t.role}</div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <StarFilled key={j} className="text-amber-500" style={{ fontSize: 11 }} />
                ))}
                {Array.from({ length: 5 - t.rating }).map((_, j) => (
                  <StarFilled key={`e-${j}`} className="text-muted" style={{ fontSize: 11 }} />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;