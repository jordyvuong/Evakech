import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Initialiser EmailJS au chargement
  React.useEffect(() => {
    emailjs.init(import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    // Validation du téléphone
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMessage('Numéro de téléphone invalide');
      return false;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Email invalide');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setErrorMessage('');
    
    // Validation
    if (!validateForm()) {
      setStatus('error');
      return;
    }

    setStatus('sending');
    
    try {
      // Préparer les données avec la date
      const templateParams = {
        ...formData,
        date: new Date().toLocaleString('fr-FR'),
        to_email: 'contact@evakech.com', // Votre email
        reply_to: formData.email // Email du client pour répondre
      };

      // Envoyer l'email
      const response = await emailjs.send(
        import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
        import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        setStatus('success');
        
        // Réinitialiser le formulaire
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        });

        // Message de succès pendant 5 secondes
        setTimeout(() => {
          setStatus('idle');
        }, 5000);
      }
    } catch (error) {
      console.error('Erreur EmailJS:', error);
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
      
      // Reset après 5 secondes
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {/* Message de statut */}
      {status === 'success' && (
        <div className="alert alert-success">
          ✅ Votre demande a été envoyée avec succès ! Nous vous répondrons dans les 2h.
        </div>
      )}
      
      {status === 'error' && errorMessage && (
        <div className="alert alert-error">
          ❌ {errorMessage}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstname">Prénom *</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
            disabled={status === 'sending'}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastname">Nom *</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
            disabled={status === 'sending'}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="exemple@email.com"
          disabled={status === 'sending'}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="phone">Téléphone (WhatsApp) *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="+212 6 00 00 00 00"
          disabled={status === 'sending'}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="service">Type de demande *</label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          required
          disabled={status === 'sending'}
        >
          <option value="">Sélectionnez...</option>
          <option value="Gestion de bien">Mise en gestion de bien</option>
          <option value="Séjour et réservation">Séjour & réservation</option>
          <option value="Service VIP">Service VIP & assistance</option>
          <option value="Package CAN 2025">Package CAN 2025</option>
          <option value="Autre">Autre demande</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Décrivez votre projet ou vos besoins..."
          rows={5}
          disabled={status === 'sending'}
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            required
            disabled={status === 'sending'}
          />
          <span>
            J'accepte que mes données soient utilisées pour me recontacter 
            conformément à la politique de confidentialité
          </span>
        </label>
      </div>
      
      <button 
        type="submit" 
        className="form-submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? (
          <span className="loading">
            <span className="spinner"></span> Envoi en cours...
          </span>
        ) : status === 'success' ? (
          '✓ Envoyé avec succès !'
        ) : (
          'Envoyer ma demande'
        )}
      </button>
    </form>
  );
};

export default ContactForm;

// Styles CSS
const styles = `
.contact-form {
  background: rgba(248, 245, 240, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(207, 174, 112, 0.2);
  border-radius: 25px;
  padding: 40px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(13, 13, 13, 0.15);
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  flex: 1;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  color: rgba(13, 13, 13, 0.8);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 15px 20px;
  background: rgba(248, 245, 240, 0.5);
  border: 1px solid rgba(207, 174, 112, 0.3);
  border-radius: 15px;
  color: #0D0D0D;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #CFAE70;
  background: rgba(248, 245, 240, 0.8);
  box-shadow: 0 0 20px rgba(207, 174, 112, 0.1);
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  background: rgba(191, 182, 164, 0.3);
  color: rgba(13, 13, 13, 0.5);
  cursor: not-allowed;
  border-color: rgba(191, 182, 164, 0.5);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0.2rem 0;
}

.alert {
  padding: 1rem;
  border-radius: 15px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.alert-success {
  background: rgba(207, 174, 112, 0.1);
  color: #0D0D0D;
  border: 1px solid rgba(207, 174, 112, 0.3);
}

.alert-error {
  background: rgba(191, 182, 164, 0.2);
  color: rgba(13, 13, 13, 0.8);
  border: 1px solid rgba(191, 182, 164, 0.4);
}

.form-submit {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #CFAE70 0%, #B59A5C 100%);
  color: #0D0D0D;
  border: none;
  border-radius: 50px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.form-submit::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(248, 245, 240, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.form-submit:hover::before {
  width: 300px;
  height: 300px;
}

.form-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(207, 174, 112, 0.3);
}

.form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .contact-form {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
}
`;

// Injection des styles dans le document
if (typeof window !== 'undefined' && !document.getElementById('contact-form-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'contact-form-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}