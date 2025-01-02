import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEPARTMENTS } from '../constants/departments';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Merhaba! Size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions] = useState([
    '👨‍⚕️ Doktorlarımız',
    '🏥 Departmanlar',
    '⏰ Çalışma Saatleri',
    '📞 İletişim',
    '🚑 Acil Durumlar',
    '💉 Hizmetlerimiz',
    '📋 Randevu Alma',
    '❓ SSS'
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchDepartmentInfo = async (department) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/doctors/by-department?department=${department}`);
      if (response.ok) {
        const doctors = await response.json();
        return doctors.map(doc => `Dr. ${doc.name} (${doc.department})`).join('\n');
      }
      return 'Bu departman için bilgi bulunamadı.';
    } catch (error) {
      return 'Bilgiler alınırken bir hata oluştu.';
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setMessages(prev => [...prev, { type: 'user', text: suggestion }]);
    setIsTyping(true);

    let response = '';
    switch (suggestion) {
      case '👨‍⚕️ Doktorlarımız':
        response = 'Hangi departmandaki doktorlarımız hakkında bilgi almak istersiniz?\n\n' +
          DEPARTMENTS.map(dept => `- ${dept.label} ${dept.icon}`).join('\n') +
          '\n\nLütfen departman adını yazarak seçiminizi yapın.';
        break;
      case '🏥 Departmanlar':
        response = 'Hastanemizde aşağıdaki departmanlar bulunmaktadır:\n\n' +
          DEPARTMENTS.map((dept, index) => 
            `${index + 1}. ${dept.label} ${dept.icon}`
          ).join('\n') +
          '\n\nHangi departman hakkında detaylı bilgi almak istersiniz?';
        break;
      case '⏰ Çalışma Saatleri':
        response = 'Çalışma Saatlerimiz:\n\n' +
          '🏥 Poliklinik: \n' +
          'Hafta içi: 09:00 - 17:00\n' +
          'Cumartesi: 09:00 - 13:00\n\n' +
          '🚑 Acil Servis: 7/24 açık\n\n' +
          '🔬 Laboratuvar:\n' +
          'Hafta içi: 08:00 - 16:00\n' +
          'Cumartesi: 08:00 - 12:00';
        break;
      case '📞 İletişim':
        response = '📍 Adres: Merkez Mah. Sağlık Cad. No:1\n\n' +
          '☎️ Telefon:\n' +
          'Ana Santral: 0212 XXX XX XX\n' +
          'Acil: 0212 XXX XX XX\n\n' +
          '📧 E-posta: info@medicareplus.com\n\n' +
          '🌐 Web: www.medicareplus.com';
        break;
      case '🚑 Acil Durumlar':
        response = '🚨 Acil Durumlar İçin:\n\n' +
          '1. Acil servisimiz 7/24 hizmet vermektedir\n' +
          '2. Ambulans: 112\n' +
          '3. Hastane Acil: 0212 XXX XX XX\n\n' +
          '❗ Önemli: Acil durumlarda zaman kaybetmeden 112\'yi arayın';
        break;
      case '💉 Hizmetlerimiz':
        response = '🏥 Sunduğumuz Hizmetler:\n\n' +
          '- Poliklinik Hizmetleri\n' +
          '- Laboratuvar\n' +
          '- Radyoloji\n' +
          '- Fizik Tedavi\n' +
          '- Diş Kliniği\n' +
          '- Check-up Merkezi\n' +
          '- Aşı Merkezi\n' +
          '- Diyetisyen\n' +
          '- Psikoloji';
        break;
      case '📋 Randevu Alma':
        response = 'Randevu almak için:\n\n' +
          '1. Web sitemizden online randevu\n' +
          '2. Mobil uygulamamız üzerinden\n' +
          '3. 0212 XXX XX XX numaralı çağrı merkezimiz\n\n' +
          '📱 Online randevu için giriş yapmanız gerekmektedir.';
        break;
      case '❓ SSS':
        response = 'Sık Sorulan Sorular:\n\n' +
          '1. Nasıl randevu alabilirim?\n' +
          '2. Hangi sigortalarla çalışıyorsunuz?\n' +
          '3. Check-up paketleri nelerdir?\n' +
          '4. Covid-19 testi yaptırabilir miyim?\n\n' +
          'Hangi soru hakkında bilgi almak istersiniz?';
        break;
      default:
        response = 'Üzgünüm, bu konuda bilgi veremiyorum.';
    }

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 1000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text: input }]);
    setInput('');
    setIsTyping(true);

    // Kullanıcının mesajını analiz et
    const userMessage = input.toLowerCase();
    let response = '';

    // Departman kontrolü
    const selectedDepartment = DEPARTMENTS.find(dept => 
      userMessage.includes(dept.label.toLowerCase()) || 
      userMessage.includes(dept.value.toLowerCase())
    );

    if (selectedDepartment) {
      // Seçilen departmanın doktorlarını getir
      const doctors = await fetchDepartmentInfo(selectedDepartment.value);
      response = `${selectedDepartment.label} Bölümü Doktorlarımız:\n\n${doctors}`;
    }
    else if (userMessage.includes('randevu')) {
      response = 'Randevu almak için giriş yapmanız gerekmektedir. Giriş yaptıktan sonra istediğiniz bölüm ve doktor için randevu alabilirsiniz.';
    } 
    else if (userMessage.includes('doktor')) {
      response = 'Doktorlarımız hakkında bilgi almak için lütfen departman seçin:\n\n' +
        DEPARTMENTS.map(dept => `- ${dept.label}`).join('\n');
    } 
    else if (userMessage.includes('acil')) {
      response = '🚨 Acil durumlar için 7/24 hizmet veriyoruz.\nAcil servis: 0212 XXX XX XX\nAmbulans: 112';
    } 
    else if (userMessage.includes('fiyat') || userMessage.includes('ücret')) {
      response = 'Fiyatlarımız hakkında güncel bilgi almak için:\n\n' +
        '📞 0212 XXX XX XX numaralı telefondan bilgi alabilirsiniz.\n' +
        '💳 Tüm özel sağlık sigortaları ve SGK anlaşmamız bulunmaktadır.';
    }
    else if (userMessage.includes('sigorta')) {
      response = 'Anlaşmalı olduğumuz kurumlar:\n\n' +
        '- SGK\n' +
        '- Özel Sigortalar\n' +
        '- Tamamlayıcı Sigortalar\n\n' +
        'Detaylı bilgi için 0212 XXX XX XX numaralı telefondan bilgi alabilirsiniz.';
    }
    else {
      response = 'Size nasıl yardımcı olabilirim? Aşağıdaki konulardan birini seçebilirsiniz:\n\n' +
        '- Doktorlarımız ve Departmanlar\n' +
        '- Randevu İşlemleri\n' +
        '- Çalışma Saatleri\n' +
        '- Fiyat Bilgisi\n' +
        '- Sigorta İşlemleri';
    }

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Bot Butonu */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-full shadow-lg z-50"
      >
        {isOpen ? '✕' : '💬'}
      </motion.button>

      {/* Chat Penceresi */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary-600 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">MediCare Asistan</h3>
              <p className="text-sm opacity-75">Size nasıl yardımcı olabilirim?</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      Yazıyor...
                    </motion.div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg"
                >
                  Gönder
                </motion.button>
              </div>
            </div>

            {/* Öneriler bölümünü ekleyin */}
            <div className="flex flex-wrap gap-2 p-4 border-t">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot; 