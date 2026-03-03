import { BarChartOutlined, BellOutlined, LockOutlined, MessageOutlined, TeamOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const features = [
  { 
    icon: <MessageOutlined className="text-2xl" />, 
    title: 'Complaint Management', 
    desc: 'Submit, track, and resolve campus issues effortlessly with our intuitive system.',
    bgColor: 'bg-blue-50 dark:bg-blue-90/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  { 
    icon: <TeamOutlined className="text-2xl" />, 
    title: 'Doubt Community', 
    desc: 'Collaborative learning platform where students help each other with faculty oversight.',
    bgColor: 'bg-purple-50 dark:bg-purple-90/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  { 
    icon: <BarChartOutlined className="text-2xl" />, 
    title: 'Analytics Dashboard', 
    desc: 'Real-time insights and data visualization for informed decision-making.',
    bgColor: 'bg-orange-50 dark:bg-orange-90/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  { 
    icon: <BellOutlined className="text-2xl" />, 
    title: 'Real-time Notifications', 
    desc: 'Stay updated with instant alerts on complaint status and doubt responses.',
    bgColor: 'bg-green-50 dark:bg-green-90/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  { 
    icon: <ThunderboltOutlined className="text-2xl" />, 
    title: 'Smart Routing', 
    desc: 'Automatic assignment of complaints to the right department for faster resolution.',
    bgColor: 'bg-orange-50 dark:bg-orange-90/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  { 
    icon: <LockOutlined className="text-2xl" />, 
    title: 'Secure & Private', 
    desc: 'Enterprise-grade security ensuring your data is always protected and confidential.',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-bold text-center mb-14 text-foreground"
      >
        Powerful Features for Everyone
      </motion.h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            className="rounded-2xl border-1 border-gray-300 bg-card p-7 cursor-default group"
          >
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${f.bgColor} ${f.iconColor} mb-4 group-hover:scale-110 transition-transform`}>
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