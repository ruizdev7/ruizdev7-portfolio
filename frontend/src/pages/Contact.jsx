import { useState } from "react";
import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useSubmitContactFormMutation } from "../RTK_Query_app/services/contact/contactApi";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [buttonState, setButtonState] = useState("idle"); // 'idle' | 'sending' | 'sent'

  // RTK Query mutation
  const [submitContactForm, { isLoading: isSubmitting }] =
    useSubmitContactFormMutation();

  const contactInfo = [
    {
      icon: EnvelopeIcon,
      label: "Email",
      value: "ruizdev7@outlook.com",
      href: "mailto:ruizdev7@outlook.com",
    },
    {
      icon: PhoneIcon,
      label: "Phone",
      value: "+48 500866813",
      href: "tel:+48500866813",
    },
    {
      icon: MapPinIcon,
      label: "Location",
      value: "Kostrzyn nad Odrą, Poland",
      href: null,
    },
  ];

  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/ruizdev7",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/ruizdev7",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      url: "https://twitter.com/ruizdev7",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitStatus(null);
    setButtonState("sending");

    try {
      const result = await submitContactForm(formData).unwrap();

      // Success animation: plane flies away, then show "Sent"
      setTimeout(() => {
        setButtonState("sent");

        setSubmitStatus({
          type: "success",
          message:
            result.message ||
            "Message sent successfully! I'll get back to you soon.",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });

        // Reset button state after 3 seconds
        setTimeout(() => {
          setButtonState("idle");
        }, 3000);
      }, 1500); // Wait 1.5s for plane animation
    } catch (error) {
      setButtonState("idle");
      setSubmitStatus({
        type: "error",
        message:
          error?.data?.error ||
          error?.data?.message ||
          error?.message ||
          "Failed to send message. Please try again later or reach out directly via email.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue transition-colors duration-200 group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-do_text_light dark:text-do_text_dark mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-do_text_gray_light dark:text-do_text_gray_dark max-w-2xl mx-auto">
            Have a question or want to work together? Feel free to reach out!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Cards */}
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <item.icon className="w-6 h-6 text-do_blue dark:text-do_blue mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-do_text_light dark:text-do_text_dark hover:text-do_blue dark:hover:text-do_blue transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-do_text_light dark:text-do_text_dark">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-do_text_light dark:text-do_text_dark mb-4">
                Follow Me
              </h2>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_blue dark:hover:text-do_blue transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="relative bg-gradient-to-br from-do_blue via-do_blue to-[#015a85] rounded-lg shadow-xl p-6 text-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-12 -mb-12"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <BriefcaseIcon className="w-8 h-8 text-white/90" />
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-100">
                      Available
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-3 group-hover:translate-x-1 transition-transform">
                  Available for Projects
                </h2>
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                  I&apos;m currently available for freelance work and full-time
                  opportunities. Let&apos;s discuss your project!
                </p>

                {/* Download CV Button */}
                <a
                  href="/CV_Joseph_Ruiz.pdf"
                  download="CV_Joseph_Ruiz.pdf"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-white/30 hover:border-white/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>Download CV</span>
                </a>
              </div>

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-do_text_light dark:text-do_text_dark mb-6">
                Send Me a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`peer h-12 w-full rounded-lg border-2 ${
                      errors.name
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-600 dark:border-gray-600 focus:border-do_blue dark:focus:border-do_blue"
                    } bg-gray-50 dark:bg-[#2C2F36] px-4 text-do_text_light dark:text-white placeholder-transparent focus:outline-none transition-colors`}
                    placeholder=" "
                  />
                  <label
                    className={`absolute left-3 -top-2.5 px-1 text-sm transition-all bg-do_card_light dark:bg-[#2C2F36] ${
                      errors.name
                        ? "text-red-500"
                        : "text-do_text_gray_light dark:text-gray-400 peer-focus:text-do_blue"
                    } peer-placeholder-shown:text-base peer-placeholder-shown:text-do_text_gray_light peer-placeholder-shown:dark:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm`}
                  >
                    Name *
                  </label>
                  {errors.name && (
                    <span className="text-red-500 text-xs font-semibold block mt-1">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`peer h-12 w-full rounded-lg border-2 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-600 dark:border-gray-600 focus:border-do_blue dark:focus:border-do_blue"
                    } bg-gray-50 dark:bg-[#2C2F36] px-4 text-do_text_light dark:text-white placeholder-transparent focus:outline-none transition-colors`}
                    placeholder=" "
                  />
                  <label
                    className={`absolute left-3 -top-2.5 px-1 text-sm transition-all bg-do_card_light dark:bg-[#2C2F36] ${
                      errors.email
                        ? "text-red-500"
                        : "text-do_text_gray_light dark:text-gray-400 peer-focus:text-do_blue"
                    } peer-placeholder-shown:text-base peer-placeholder-shown:text-do_text_gray_light peer-placeholder-shown:dark:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm`}
                  >
                    Email *
                  </label>
                  {errors.email && (
                    <span className="text-red-500 text-xs font-semibold block mt-1">
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Subject */}
                <div className="relative">
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`peer h-12 w-full rounded-lg border-2 ${
                      errors.subject
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-600 dark:border-gray-600 focus:border-do_blue dark:focus:border-do_blue"
                    } bg-gray-50 dark:bg-[#2C2F36] px-4 text-do_text_light dark:text-white placeholder-transparent focus:outline-none transition-colors`}
                    placeholder=" "
                  />
                  <label
                    className={`absolute left-3 -top-2.5 px-1 text-sm transition-all bg-do_card_light dark:bg-[#2C2F36] ${
                      errors.subject
                        ? "text-red-500"
                        : "text-do_text_gray_light dark:text-gray-400 peer-focus:text-do_blue"
                    } peer-placeholder-shown:text-base peer-placeholder-shown:text-do_text_gray_light peer-placeholder-shown:dark:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm`}
                  >
                    Subject *
                  </label>
                  {errors.subject && (
                    <span className="text-red-500 text-xs font-semibold block mt-1">
                      {errors.subject}
                    </span>
                  )}
                </div>

                {/* Message */}
                <div className="relative">
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className={`peer w-full rounded-lg border-2 pt-4 pb-2 px-4 ${
                      errors.message
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-600 dark:border-gray-600 focus:border-do_blue dark:focus:border-do_blue"
                    } bg-gray-50 dark:bg-[#2C2F36] text-do_text_light dark:text-white placeholder-transparent focus:outline-none transition-colors resize-none`}
                    placeholder=" "
                  />
                  <label
                    className={`absolute left-3 -top-2.5 px-1 text-sm transition-all bg-do_card_light dark:bg-[#2C2F36] ${
                      errors.message
                        ? "text-red-500"
                        : "text-do_text_gray_light dark:text-gray-400 peer-focus:text-do_blue"
                    } peer-placeholder-shown:text-base peer-placeholder-shown:text-do_text_gray_light peer-placeholder-shown:dark:text-gray-500 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm`}
                  >
                    Message *
                  </label>
                  {errors.message && (
                    <span className="text-red-500 text-xs font-semibold block mt-1">
                      {errors.message}
                    </span>
                  )}
                </div>

                {/* Submit Status */}
                {submitStatus && (
                  <div
                    className={`p-4 rounded-lg flex items-start space-x-3 ${
                      submitStatus.type === "success"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    {submitStatus.type === "success" ? (
                      <CheckCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="flex-1">{submitStatus.message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || buttonState === "sent"}
                  className={`w-full bg-gradient-to-r from-do_blue to-do_blue hover:from-do_blue/90 hover:to-do_blue/90 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none relative overflow-hidden ${
                    buttonState === "sent"
                      ? "bg-gradient-to-r from-green-500 to-green-600"
                      : ""
                  }`}
                >
                  {/* Plane Animation Container */}
                  <div className="flex items-center justify-center space-x-2 relative min-w-[140px] min-h-[28px]">
                    {/* Idle State */}
                    {buttonState === "idle" && (
                      <div className="flex items-center space-x-2 animate-fadeIn">
                        <PaperAirplaneIcon className="w-5 h-5" />
                        <span>Send Message</span>
                      </div>
                    )}

                    {/* Sending State - Plane flies away */}
                    {buttonState === "sending" && (
                      <div className="relative w-full flex items-center justify-center">
                        <PaperAirplaneIcon className="w-5 h-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-flyAway" />
                        <span
                          className="opacity-0"
                          style={{
                            animation: "fadeIn 0.3s ease-in 0.8s forwards",
                          }}
                        >
                          Sending...
                        </span>
                      </div>
                    )}

                    {/* Sent State - Checkmark appears */}
                    {buttonState === "sent" && (
                      <div className="flex items-center space-x-2 animate-fadeIn">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Sent!</span>
                      </div>
                    )}
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
