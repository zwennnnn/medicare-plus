import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PanelCard = ({ title, description, icon, path, color }) => {
  return (
    <Link to={path}>
      <motion.div
        whileHover={{ y: -5 }}
        className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${color}`}
      >
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </motion.div>
    </Link>
  );
};

export default PanelCard; 