import { useState } from "react";
import {
  useGetContactMessagesQuery,
  useMarkMessageAsReadMutation,
} from "../RTK_Query_app/services/contact/contactApi";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const ContactMessages = () => {
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const {
    data: messagesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetContactMessagesQuery({ page, per_page: perPage });

  const [markAsRead] = useMarkMessageAsReadMutation();

  const handleMarkAsRead = async (messageId) => {
    try {
      await markAsRead(messageId).unwrap();
      refetch();
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    if (!message.read) {
      handleMarkAsRead(message.ccn_contact_message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-do_blue mx-auto mb-4"></div>
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Error loading messages</p>
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark text-sm mb-4">
            {error?.data?.error || error?.message || "Unknown error"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-do_blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const messages = messagesData?.messages || [];
  const pagination = messagesData?.pagination || {};

  return (
    <div className="min-h-screen bg-do_bg_light dark:bg-do_bg_dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-do_text_light dark:text-do_text_dark mb-2">
            Contact Messages
          </h1>
          <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
            Manage and view messages from the contact form
          </p>
        </div>

        {/* Messages Table */}
        <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-do_border_light dark:divide-do_border_dark">
              <thead className="bg-do_bg_light dark:bg-do_bg_dark">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-do_text_gray_light dark:text-do_text_gray_dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-do_card_light dark:bg-do_card_dark divide-y divide-do_border_light dark:divide-do_border_dark">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <EnvelopeIcon className="w-12 h-12 text-do_text_gray_light dark:text-do_text_gray_dark mb-4" />
                        <p className="text-do_text_gray_light dark:text-do_text_gray_dark">
                          No messages yet
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  messages.map((message) => (
                    <tr
                      key={message.ccn_contact_message}
                      className={`hover:bg-do_bg_light dark:hover:bg-do_bg_dark transition-colors ${
                        !message.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {message.read ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-do_text_light dark:text-do_text_dark">
                        {message.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                        {message.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-do_text_light dark:text-do_text_dark max-w-xs truncate">
                        {message.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                        {new Date(message.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewMessage(message)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-do_blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-do_bg_light dark:bg-do_bg_dark px-6 py-4 border-t border-do_border_light dark:border-do_border_dark">
              <div className="flex items-center justify-between">
                <div className="text-sm text-do_text_gray_light dark:text-do_text_gray_dark">
                  Showing {(page - 1) * perPage + 1} to{" "}
                  {Math.min(page * perPage, pagination.total)} of{" "}
                  {pagination.total} messages
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.has_prev}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pagination.has_prev
                        ? "bg-do_blue text-white hover:bg-opacity-90"
                        : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.has_next}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pagination.has_next
                        ? "bg-do_blue text-white hover:bg-opacity-90"
                        : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-do_card_light dark:bg-do_card_dark rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-do_text_light dark:text-do_text_dark">
                  Message Details
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMessage(null);
                  }}
                  className="text-do_text_gray_light dark:text-do_text_gray_dark hover:text-do_text_light dark:hover:text-do_text_dark"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark">
                    From
                  </label>
                  <p className="text-do_text_light dark:text-do_text_dark">
                    {selectedMessage.name} ({selectedMessage.email})
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark">
                    Subject
                  </label>
                  <p className="text-do_text_light dark:text-do_text_dark">
                    {selectedMessage.subject}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark">
                    Date
                  </label>
                  <p className="text-do_text_light dark:text-do_text_dark">
                    {new Date(selectedMessage.created_at).toLocaleString(
                      "en-US"
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-do_text_gray_light dark:text-do_text_gray_dark">
                    Message
                  </label>
                  <div className="mt-2 p-4 bg-do_bg_light dark:bg-do_bg_dark rounded-lg">
                    <p className="text-do_text_light dark:text-do_text_dark whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="px-4 py-2 bg-do_blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Reply
                  </a>
                  {!selectedMessage.read && (
                    <button
                      onClick={() => {
                        handleMarkAsRead(selectedMessage.ccn_contact_message);
                        setSelectedMessage({
                          ...selectedMessage,
                          read: true,
                        });
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
