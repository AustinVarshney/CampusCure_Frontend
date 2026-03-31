import { BarChartOutlined, BellOutlined, LockOutlined, MessageOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <MessageOutlined />,
    title: 'Complaint Management',
    desc: 'Submit, track, and resolve campus issues effortlessly with our intuitive system.',
    gradient: 'from-[#041A47] via-[#00639B] to-[#009BB0]',
    glow: 'group-hover:shadow-cyan-600/15',
  },
  {
    icon: <TeamOutlined />,
    title: 'Doubt Community',
    desc: 'Collaborative learning platform where students help each other with faculty oversight.',
    gradient: 'from-violet-600 to-purple-500',
    glow: 'group-hover:shadow-violet-500/15',
  },
  {
    icon: <BarChartOutlined />,
    title: 'Analytics Dashboard',
    desc: 'Real-time insights and data visualization for informed decision-making.',
    gradient: 'from-orange-500 to-amber-400',
    glow: 'group-hover:shadow-orange-500/15',
  },
  {
    icon: <BellOutlined />,
    title: 'Status Updates',
    desc: 'Track complaint progress and doubt responses with clear status indicators.',
    gradient: 'from-green-600 to-emerald-500',
    glow: 'group-hover:shadow-green-500/15',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'Smart Auto-Routing',
    desc: 'Intelligent complaint assignment to faculty based on expertise, department, and workload.',
    gradient: 'from-amber-500 to-orange-400',
    glow: 'group-hover:shadow-amber-500/15',
  },
  {
    icon: <LockOutlined />,
    title: 'Secure & Private',
    desc: 'Enterprise-grade security ensuring your data is always protected and confidential.',
    gradient: 'from-indigo-600 to-blue-600',
    glow: 'group-hover:shadow-indigo-500/15',
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#00639B]/10 text-[#00639B] dark:text-[#009BB0] text-xs font-semibold uppercase tracking-wider mb-4">
          Features
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Everything your campus needs,{' '}
          <span className="bg-linear-to-r from-[#041A47] via-[#00639B] to-[#009BB0] bg-clip-text text-transparent">
            in one place
          </span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A comprehensive platform built to handle every aspect of campus management efficiently.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            whileHover={{ y: -5 }}
            className={`group relative rounded-3xl border border-gray-500 bg-card p-7 overflow-hidden cursor-default transition-all hover:shadow-2xl ${f.glow}`}
          >
            {/* Subtle gradient overlay on hover */}
            <div className={`absolute inset-0 bg-linear-to-br ${f.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 rounded-3xl`} />
            {/* Top accent line */}
            <div className={`absolute top-0 inset-x-0 h-0.5 bg-linear-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className={`relative h-12 w-12 rounded-2xl bg-linear-to-br ${f.gradient} flex items-center justify-center text-white text-xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {f.icon}
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;