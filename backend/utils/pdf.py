from weasyprint import HTML, CSS
from jinja2 import Template
import os
from datetime import datetime

def render_invoice_pdf(invoice, client, team, logo_url=None):
    # Compact professional HTML template for single-page invoices
    html_template = Template('''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #{{ invoice.number }}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.4;
                color: #1f2937;
                font-size: 14px;
                background: white;
                padding: 20px;
            }
            
            .invoice-container {
                max-width: 750px;
                margin: 0 auto;
                background: white;
            }
            
            /* Compact Header */
            .invoice-header {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .company-info {
                flex: 1;
            }
            
            .company-logo {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                font-size: 18px;
                vertical-align: middle;
            }
            
            .company-logo-img {
                width: 40px;
                height: 40px;
                border-radius: 6px;
                margin-right: 12px;
                vertical-align: middle;
                object-fit: cover;
                background: rgba(255, 255, 255, 0.2);
            }
            
            .company-name {
                font-size: 24px;
                font-weight: 700;
                display: inline-block;
                vertical-align: middle;
            }
            
            .company-tagline {
                font-size: 12px;
                opacity: 0.9;
                margin-top: 4px;
            }
            
            .invoice-title {
                text-align: right;
            }
            
            .invoice-title h1 {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 4px;
            }
            
            .invoice-number {
                font-size: 14px;
                opacity: 0.9;
            }
            
            /* Compact Body */
            .invoice-body {
                margin-bottom: 16px;
            }
            
            .invoice-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                gap: 20px;
            }
            
            .detail-section {
                flex: 1;
            }
            
            .section-title {
                font-size: 12px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 8px;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 4px;
            }
            
            .detail-item {
                margin-bottom: 6px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .detail-label {
                font-weight: 500;
                color: #6b7280;
                font-size: 12px;
            }
            
            .detail-value {
                font-weight: 600;
                color: #111827;
                font-size: 12px;
            }
            
            /* Status Badge */
            .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .status-paid {
                background: #dcfce7;
                color: #166534;
                border: 1px solid #bbf7d0;
            }
            
            .status-unpaid {
                background: #fef3c7;
                color: #92400e;
                border: 1px solid #fde68a;
            }
            
            .status-overdue {
                background: #fee2e2;
                color: #991b1b;
                border: 1px solid #fecaca;
            }
            
            /* Compact Amount Section */
            .amount-section {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                text-align: center;
                border: 1px solid #e5e7eb;
            }
            
            .amount-label {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                margin-bottom: 4px;
            }
            
            .amount-value {
                font-size: 28px;
                font-weight: 700;
                color: #1f2937;
            }
            
            .amount-currency {
                font-size: 16px;
                color: #6b7280;
                margin-left: 4px;
            }
            
            /* Compact Client Info */
            .client-section {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .client-name {
                font-size: 16px;
                font-weight: 700;
                color: #1f2937;
                margin-bottom: 8px;
            }
            
            .client-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 8px;
            }
            
            .client-detail {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            
            .client-detail-label {
                font-size: 10px;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .client-detail-value {
                font-size: 12px;
                font-weight: 500;
                color: #1f2937;
            }
            
            /* Compact Footer */
            .invoice-footer {
                background: #f9fafb;
                padding: 16px;
                border-top: 1px solid #e5e7eb;
                border-radius: 0 0 8px 8px;
                text-align: center;
            }
            
            .footer-text {
                color: #6b7280;
                font-size: 11px;
                line-height: 1.4;
            }
            
            .footer-highlight {
                color: #3b82f6;
                font-weight: 600;
            }
            
            /* Print Optimizations */
            @media print {
                body {
                    padding: 0;
                }
                .invoice-container {
                    max-width: none;
                }
            }
            
            @page {
                size: A4;
                margin: 0.5in;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Compact Header -->
            <div class="invoice-header">
                <div class="header-content">
                    <div class="company-info">
                        {% if logo_url %}
                        <img src="{{ logo_url }}" alt="Company Logo" class="company-logo-img" />
                        {% else %}
                        <div class="company-logo">🧾</div>
                        {% endif %}
                        <div class="company-name">{{ team.name }}</div>
                        <div class="company-tagline">Professional Invoice Management</div>
                    </div>
                    <div class="invoice-title">
                        <h1>INVOICE</h1>
                        <div class="invoice-number">#{{ invoice.number }}</div>
                    </div>
                </div>
            </div>
            
            <!-- Compact Body -->
            <div class="invoice-body">
                <!-- Client Information -->
                <div class="client-section">
                    <div class="client-name">{{ client.name }}</div>
                    <div class="client-details">
                        {% if client.phone %}
                        <div class="client-detail">
                            <div class="client-detail-label">Phone</div>
                            <div class="client-detail-value">{{ client.phone }}</div>
                        </div>
                        {% endif %}
                        {% if client.ice %}
                        <div class="client-detail">
                            <div class="client-detail-label">ICE Number</div>
                            <div class="client-detail-value">{{ client.ice }}</div>
                        </div>
                        {% endif %}
                        {% if client.if_number %}
                        <div class="client-detail">
                            <div class="client-detail-label">IF Number</div>
                            <div class="client-detail-value">{{ client.if_number }}</div>
                        </div>
                        {% endif %}
                    </div>
                </div>
                
                <!-- Invoice Details -->
                <div class="invoice-details">
                    <div class="detail-section">
                        <div class="section-title">Invoice Details</div>
                        <div class="detail-item">
                            <span class="detail-label">Invoice Number:</span>
                            <span class="detail-value">#{{ invoice.number }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Issue Date:</span>
                            <span class="detail-value">{{ invoice.created_at.strftime('%B %d, %Y') if invoice.created_at else 'N/A' }}</span>
                        </div>
                        {% if invoice.due_date %}
                        <div class="detail-item">
                            <span class="detail-label">Due Date:</span>
                            <span class="detail-value">{{ invoice.due_date.strftime('%B %d, %Y') }}</span>
                        </div>
                        {% endif %}
                    </div>
                    
                    <div class="detail-section">
                        <div class="section-title">Payment Status</div>
                        <div class="detail-item">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">
                                <span class="status-badge status-{{ invoice.status }}">
                                    {{ invoice.status.title() }}
                                </span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Currency:</span>
                            <span class="detail-value">{{ invoice.currency }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Compact Amount Section -->
                <div class="amount-section">
                    <div class="amount-label">Total Amount</div>
                    <div class="amount-value">
                        {{ "{:,.2f}".format(invoice.amount) }}
                        <span class="amount-currency">{{ invoice.currency }}</span>
                    </div>
                </div>
            </div>
            
            <!-- Compact Footer -->
            <div class="invoice-footer">
                <div class="footer-text">
                    <strong class="footer-highlight">Thank you for your business!</strong><br>
                    This invoice was generated by <span class="footer-highlight">{{ team.name }}</span> using Fatoora.<br>
                    Generated on {{ now.strftime('%B %d, %Y at %I:%M %p') }}
                </div>
            </div>
        </div>
    </body>
    </html>
    ''')
    
    # Render the template with current timestamp
    html = html_template.render(
        invoice=invoice, 
        client=client, 
        team=team, 
        logo_url=f"file://{logo_url}" if logo_url else None,
        now=datetime.now()
    )
    
    # Generate PDF with optimized settings for single page
    pdf = HTML(string=html).write_pdf(
        stylesheets=[],
        presentational_hints=True,
        optimize_images=True
    )
    
    return pdf 