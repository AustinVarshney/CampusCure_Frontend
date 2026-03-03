import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Who can use CampusCure?',
    answer: 'CampusCure is designed for students, faculty members, and administrators in educational institutions. Each user type has specific features tailored to their needs.',
  },
  {
    question: 'How do I track my complaint status?',
    answer: 'Once you submit a complaint, you can track it in real-time from your dashboard. You\'ll receive notifications when the status changes, and can view detailed updates throughout the resolution process.',
  },
  {
    question: 'Is there a mobile app available?',
    answer: 'CampusCure is currently a responsive web application that works seamlessly on all devices - desktop, tablet, and mobile. A dedicated mobile app is planned for future release.',
  },
  {
    question: 'How does the doubt community work?',
    answer: 'Students can post academic doubts which can be answered by peers and verified by faculty members. This creates a collaborative learning environment with quality-assured answers.',
  },
  {
    question: 'What types of complaints can I submit?',
    answer: 'You can submit various types of complaints including infrastructure issues, maintenance requests, academic concerns, administrative queries, and more. The system automatically routes them to the appropriate department.',
  },
  {
    question: 'How secure is my data?',
    answer: 'We take security seriously. All data is encrypted, and we follow industry-standard security practices. User information is protected and only accessible to authorized personnel.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-6 bg-background">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Find quick answers to common questions about CampusCure
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="border  rounded-xl overflow-hidden bg-card"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-accent transition-colors"
              >
                <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                <span className="text-blue-600 dark:text-blue-400 shrink-0">
                  {openIndex === index ? (
                    <MinusOutlined className="text-lg" />
                  ) : (
                    <PlusOutlined className="text-lg" />
                  )}
                </span>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? 'auto' : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-1 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
