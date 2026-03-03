import { StarFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Ankit Sharma',
    role: 'B.Tech CSE, 3rd Year',
    quote: 'CampusCure made it so easy to report the broken projector in our lab. It was fixed within 2 days!',
    avatar: '🎓',
    rating: 5,
  },
  {
    name: 'Dr. Priya Mehta',
    role: 'Associate Professor, CS Dept',
    quote: 'The doubt community has transformed how students seek help. I can verify answers and ensure quality discussions.',
    avatar: '👩‍🏫',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'B.Tech ECE, 2nd Year',
    quote: 'I love the real-time tracking. I always know the status of my complaint without having to chase anyone.',
    avatar: '📚',
    rating: 4,
  },
  {
    name: 'Prof. Suresh Iyer',
    role: 'Head of Department, ME',
    quote: 'The analytics dashboard gives us clear insights into recurring issues. We\'ve reduced complaint resolution time by 40%.',
    avatar: '👨‍💼',
    rating: 5,
  },
  {
    name: 'Sneha Patel',
    role: 'M.Tech IT, 1st Year',
    quote: 'The doubt community is a lifesaver during exam season. Peer answers and faculty verification build real confidence.',
    avatar: '💡',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Campus Administrator',
    quote: 'Managing hundreds of complaints across departments is now streamlined. The assignment system works perfectly.',
    avatar: '🏛️',
    rating: 4,
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 px-6 bg-muted/30">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
          Loved by the campus community
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
          See what students, faculty, and administrators say about CampusCure.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            className="rounded-2xl border-1 border-gray-300 bg-card p-6 cursor-default flex flex-col"
          >
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <StarFilled key={j} className="text-orange-500 text-sm" />
              ))}
              {Array.from({ length: 5 - t.rating }).map((_, j) => (
                <StarFilled key={j} className="text-muted text-sm" />
              ))}
            </div>

            <p className="text-sm text-foreground leading-relaxed flex-1">"{t.quote}"</p>

            <div className="flex items-center gap-3 mt-5 pt-4 border-t ">
              <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-lg">
                {t.avatar}
              </div>
              <div>
                <div className="font-semibold text-sm text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;