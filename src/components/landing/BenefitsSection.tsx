import { BookOutlined, CheckOutlined, DeploymentUnitOutlined, TeamOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: <TeamOutlined className="text-2xl" />,
    title: 'For Students',
    gradient: 'from-[#041A47] via-[#00639B] to-[#009BB0]',
    shadow: 'hover:shadow-cyan-600/15',
    items: [
      'Submit and track complaints effortlessly',
      'Get quick answers from the doubt community',
      'Stay informed with status updates',
      'Build knowledge through peer collaboration',
    ],
  },
  {
    icon: <BookOutlined className="text-2xl" />,
    title: 'For Faculty',
    gradient: 'from-violet-600 to-purple-500',
    shadow: 'hover:shadow-violet-500/15',
    items: [
      'Verify and guide student discussions',
      'Monitor campus issues efficiently',
      'Access analytics on student engagement',
      'Streamline administrative workflows',
    ],
  },
  {
    icon: <DeploymentUnitOutlined className="text-2xl" />,
    title: 'For Administrators',
    gradient: 'from-orange-500 to-amber-400',
    shadow: 'hover:shadow-orange-500/15',
    items: [
      'Centralized complaint management system',
      'Data-driven insights and reporting',
      'Efficient assignment and management',
      'Improve campus services strategically',
    ],
  },
];

const BenefitsSection = () => (
  <section id="benefits" className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-600/10 text-green-600 dark:text-green-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Why Choose Us
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Built for{' '}
          <span className="bg-linear-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            every role
          </span>
          {' '}on campus
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Tailored features designed around the unique needs of each campus stakeholder.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            whileHover={{ y: -6 }}
            className={`relative group rounded-3xl bg-card border border-border p-8 overflow-hidden hover:shadow-2xl ${b.shadow} transition-all duration-300`}
          >
            {/* Top gradient line */}
            <div className={`absolute top-0 inset-x-0 h-0.75 bg-linear-to-r ${b.gradient}`} />

            <div className={`h-14 w-14 rounded-2xl bg-linear-to-br ${b.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {b.icon}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-5">{b.title}</h3>

            <ul className="space-y-3">
              {b.items.map((item, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className={`shrink-0 h-5 w-5 rounded-full bg-linear-to-br ${b.gradient} flex items-center justify-center mt-0.5 shadow-sm`}>
                    <CheckOutlined className="text-white" style={{ fontSize: 9 }} />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
