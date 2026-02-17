import { useState } from 'react';
import { EmailTemplate, emailTemplatesService } from '../../services/email-templates.service';

interface EmailTemplatesTabProps {
  templates: EmailTemplate[];
  onRefresh: () => void;
}

const TEMPLATE_NAMES: Record<string, string> = {
  welcome: 'Welcome Email',
  password_reset: 'Password Reset',
  account_verification: 'Account Verification',
  security_alert: 'Security Alert',
  system_notification: 'System Notification'
};

export default function EmailTemplatesTab({ templates, onRefresh }: EmailTemplatesTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ subject: '', bodyHtml: '', bodyText: '' });
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      bodyText: template.bodyText
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    
    try {
      setLoading(true);
      await emailTemplatesService.updateTemplate(selectedTemplate.templateType, formData);
      setMessage('Template updated successfully!');
      setEditing(false);
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (templateType: string) => {
    if (!confirm('Restore default template? This will overwrite your changes.')) return;
    
    try {
      setLoading(true);
      await emailTemplatesService.restoreDefault(templateType);
      setMessage('Template restored to default!');
      onRefresh();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSend = async () => {
    if (!selectedTemplate || !testEmail) return;
    
    try {
      setLoading(true);
      await emailTemplatesService.testSend(selectedTemplate.templateType, testEmail, {
        userName: 'Test User',
        tenantName: 'Test Tenant',
        platformName: 'Super Admin Platform'
      });
      setMessage('Test email sent successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Email Templates</h3>
        <p className="text-sm text-gray-600 mb-6">Customize platform-wide email templates. Use variables like {{userName}}, {{tenantName}}, etc.</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template List */}
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer"
              onClick={() => handleEdit(template)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {TEMPLATE_NAMES[template.templateType] || template.templateType}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">Version {template.version}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(template.templateType);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Restore Default
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Template Editor */}
        {editing && selectedTemplate && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-4">
              Edit {TEMPLATE_NAMES[selectedTemplate.templateType]}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">HTML Body</label>
                <textarea
                  value={formData.bodyHtml}
                  onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Plain Text Body</label>
                <textarea
                  value={formData.bodyText}
                  onChange={(e) => setFormData({ ...formData, bodyText: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Available variables:</strong> {selectedTemplate.variables}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleTestSend}
                  disabled={loading || !testEmail}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Test Send
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Save Template
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
