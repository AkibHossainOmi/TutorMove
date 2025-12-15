from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
from io import BytesIO


class PaymentStatementPDF:
    """
    Generates professional bank-style payment statements in PDF format.
    """

    def __init__(self, payments, start_date, end_date, admin_name):
        """
        Initialize the PDF generator.

        Args:
            payments: QuerySet of Payment objects
            start_date: Start date string for the statement period
            end_date: End date string for the statement period
            admin_name: Name of the admin generating the statement
        """
        self.payments = payments
        self.start_date = start_date
        self.end_date = end_date
        self.admin_name = admin_name
        self.buffer = BytesIO()

        # Use landscape orientation for more width
        self.doc = SimpleDocTemplate(
            self.buffer,
            pagesize=landscape(A4),
            rightMargin=30,
            leftMargin=30,
            topMargin=40,
            bottomMargin=40
        )
        self.styles = getSampleStyleSheet()
        self.elements = []

    def _create_custom_styles(self):
        """Create custom paragraph styles for the PDF."""
        # Company name style
        self.styles.add(ParagraphStyle(
            name='CompanyName',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#4F46E5'),  # Indigo-600
            alignment=TA_CENTER,
            spaceAfter=6
        ))

        # Statement title style
        self.styles.add(ParagraphStyle(
            name='StatementTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1F2937'),  # Gray-800
            alignment=TA_CENTER,
            spaceAfter=12
        ))

        # Date range style
        self.styles.add(ParagraphStyle(
            name='DateRange',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#6B7280'),  # Gray-500
            alignment=TA_CENTER,
            spaceAfter=20
        ))

        # Footer style
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#9CA3AF'),  # Gray-400
            alignment=TA_CENTER
        ))

        # Cell text style - for wrapping text in table cells
        self.styles.add(ParagraphStyle(
            name='CellText',
            parent=self.styles['Normal'],
            fontSize=7,
            leading=9,
            alignment=TA_LEFT
        ))

        # Small cell text - for very compact cells
        self.styles.add(ParagraphStyle(
            name='SmallCell',
            parent=self.styles['Normal'],
            fontSize=6,
            leading=8,
            alignment=TA_LEFT
        ))

    def _add_header(self):
        """Add the statement header with company name and date range."""
        # Company name
        company_name = Paragraph("TutorMove", self.styles['CompanyName'])
        self.elements.append(company_name)

        # Statement title
        title = Paragraph("Payment Statement", self.styles['StatementTitle'])
        self.elements.append(title)

        # Date range
        date_range_text = f"Statement Period: {self.start_date} to {self.end_date}"
        date_range = Paragraph(date_range_text, self.styles['DateRange'])
        self.elements.append(date_range)

        self.elements.append(Spacer(1, 12))

    def _add_summary(self):
        """Add summary statistics section."""
        total_transactions = self.payments.count()
        total_amount = sum(p.amount for p in self.payments)

        # Count by status
        success_count = sum(1 for p in self.payments if p.status == 'SUCCESS')
        pending_count = sum(1 for p in self.payments if p.status == 'PENDING')
        failed_count = sum(1 for p in self.payments if p.status == 'FAILED')

        # Create summary table
        summary_data = [
            ['Total Transactions:', str(total_transactions)],
            ['Total Amount:', f"{total_amount:,.2f} BDT"],
            ['Successful Payments:', str(success_count)],
            ['Pending Payments:', str(pending_count)],
            ['Failed Payments:', str(failed_count)],
        ]

        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3F4F6')),  # Gray-100
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1F2937')),  # Gray-800
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),  # Gray-200
        ]))

        self.elements.append(summary_table)
        self.elements.append(Spacer(1, 20))

    def _truncate_text(self, text, max_length=20):
        """Truncate text if it's too long."""
        if text and len(str(text)) > max_length:
            return str(text)[:max_length-3] + '...'
        return str(text) if text else 'N/A'

    def _add_transactions_table(self):
        """Add detailed transactions table."""
        # Table header
        table_data = [[
            Paragraph('<b>Date</b>', self.styles['SmallCell']),
            Paragraph('<b>Transaction ID</b>', self.styles['SmallCell']),
            Paragraph('<b>Bank Transaction ID</b>', self.styles['SmallCell']),
            Paragraph('<b>Order ID</b>', self.styles['SmallCell']),
            Paragraph('<b>User</b>', self.styles['SmallCell']),
            Paragraph('<b>Amount<br/>(BDT)</b>', self.styles['SmallCell']),
            Paragraph('<b>Status</b>', self.styles['SmallCell'])
        ]]

        # Add transaction rows
        for payment in self.payments:
            user = payment.order.user if payment.order and payment.order.user else None

            # Format date
            date_str = payment.payment_date.strftime('%Y-%m-%d<br/>%H:%M') if payment.payment_date else 'N/A'

            # Show full IDs (no truncation)
            trx_id = payment.transaction_id or 'N/A'
            bank_trx_id = payment.bank_transaction_id or 'N/A'

            # User info
            username = self._truncate_text(user.username if user else 'Guest', 15)

            row = [
                Paragraph(date_str, self.styles['SmallCell']),
                Paragraph(trx_id, self.styles['SmallCell']),
                Paragraph(bank_trx_id, self.styles['SmallCell']),
                Paragraph(str(payment.order.id) if payment.order else 'N/A', self.styles['SmallCell']),
                Paragraph(username, self.styles['SmallCell']),
                Paragraph(f"{payment.amount:,.2f}", self.styles['SmallCell']),
                Paragraph(payment.status, self.styles['SmallCell'])
            ]
            table_data.append(row)

        # Optimized column widths for landscape A4 - more space for full transaction IDs
        col_widths = [
            1.0*inch,   # Date
            2.2*inch,   # Transaction ID (wider for full ID)
            2.2*inch,   # Bank Transaction ID (wider for full ID)
            0.6*inch,   # Order ID
            1.2*inch,   # User
            0.9*inch,   # Amount
            0.8*inch    # Status
        ]

        transactions_table = Table(table_data, colWidths=col_widths, repeatRows=1)

        # Style the table
        table_style = [
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),  # Indigo-600
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),

            # Data rows styling
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 7.5),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 1), (-1, -1), 'TOP'),

            # Amount column right-aligned (column index 5)
            ('ALIGN', (5, 1), (5, -1), 'RIGHT'),

            # Center align order ID and status (columns 3 and 6)
            ('ALIGN', (3, 1), (3, -1), 'CENTER'),
            ('ALIGN', (6, 1), (6, -1), 'CENTER'),

            # Grid and borders
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),  # Gray-300
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]

        # Alternating row colors for better readability
        for i in range(1, len(table_data)):
            if i % 2 == 0:
                table_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F9FAFB')))  # Gray-50

        transactions_table.setStyle(TableStyle(table_style))

        # Add section title
        section_title = Paragraph("<b>Transaction Details</b>", self.styles['Heading3'])
        self.elements.append(section_title)
        self.elements.append(Spacer(1, 10))

        self.elements.append(transactions_table)

    def _add_footer(self):
        """Add footer with generation info."""
        self.elements.append(Spacer(1, 20))

        generation_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        footer_text = f"Generated on {generation_time} by {self.admin_name}"
        footer = Paragraph(footer_text, self.styles['Footer'])
        self.elements.append(footer)

        disclaimer = Paragraph(
            "This is a computer-generated statement and does not require a signature.",
            self.styles['Footer']
        )
        self.elements.append(Spacer(1, 6))
        self.elements.append(disclaimer)

    def generate(self):
        """
        Generate the PDF and return the buffer.

        Returns:
            BytesIO: Buffer containing the PDF data
        """
        # Create custom styles
        self._create_custom_styles()

        # Build the PDF content
        self._add_header()
        self._add_summary()
        self._add_transactions_table()
        self._add_footer()

        # Build the PDF
        self.doc.build(self.elements)

        # Reset buffer position to the beginning
        self.buffer.seek(0)

        return self.buffer
