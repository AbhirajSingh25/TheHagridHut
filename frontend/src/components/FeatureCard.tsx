import { motion } from "framer-motion";

type Props = {
  title: string;
  description: string;
  icon: React.ElementType;
};

function FeatureCard({
  title,
  description,
  icon: Icon,
}: Props) {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(0,255,255,0.08)] hover:border-cyan-400/40"
    >
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-3xl shadow-[0_0_20px_rgba(34,211,238,0.4)]">
        <Icon />
      </div>

      <h3 className="text-2xl font-bold mt-6">
        {title}
      </h3>

      <p className="text-gray-400 mt-4 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export default FeatureCard;