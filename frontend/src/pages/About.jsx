import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Hakkımızda
          </h1>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            Modern tıp teknolojileri ve uzman kadromuzla sağlığınız için buradayız.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="text-4xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold mb-2">Modern Tesisler</h3>
            <p className="text-gray-600">
              En son teknoloji ile donatılmış modern tesislerimizde kaliteli sağlık hizmeti sunuyoruz.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2">Uzman Kadro</h3>
            <p className="text-gray-600">
              Alanında uzman doktorlarımız ve deneyimli sağlık personelimizle yanınızdayız.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Hasta Odaklı</h3>
            <p className="text-gray-600">
              Hastalarımızın konforu ve memnuniyeti bizim için her şeyden önemlidir.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default About; 