import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import type { CompanySettings, Client, InvoiceItem, Invoice } from "@/lib/firebase/types"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 30,
    backgroundColor: "#ffffff",
  },
  // Title
  titleContainer: {
    textAlign: "center",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textDecoration: "underline",
  },
  // Main grid container
  mainGrid: {
    border: "1px solid #374151",
    marginBottom: 10,
  },
  // Top section with company and invoice details
  topSection: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  // Company details (left side)
  companySection: {
    width: "50%",
    borderRightWidth: 1,
    borderRightColor: "#374151",
    flexDirection: "column",
  },
  companyDetailsTop: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  companyText: {
    fontSize: 8,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  buyerSection: {
    padding: 8,
  },
  sectionLabel: {
    fontSize: 7,
    color: "#6B7280",
    marginBottom: 3,
  },
  buyerName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },
  buyerText: {
    fontSize: 8,
    lineHeight: 1.4,
  },
  // Right section (invoice details + QR)
  rightSection: {
    width: "50%",
    flexDirection: "column",
  },
  invoiceDetailsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  invoiceDetailCell: {
    width: "50%",
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#374151",
  },
  invoiceDetailCellLast: {
    width: "50%",
    padding: 6,
  },
  detailLabel: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  qrSection: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FED7AA",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    minHeight: 120,
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  termsSection: {
    padding: 6,
  },
  termsLabel: {
    fontSize: 7,
    fontWeight: "bold",
  },
  // Table styles
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    minHeight: 20,
  },
  // Table columns with borders
  colSNo: {
    width: "6%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    textAlign: "center",
    fontSize: 8,
    justifyContent: "center",
  },
  colDescription: {
    width: "30%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    fontSize: 8,
    justifyContent: "center",
  },
  colLocation: {
    width: "14%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    textAlign: "center",
    fontSize: 8,
    justifyContent: "center",
  },
  colQuantity: {
    width: "12%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    textAlign: "right",
    fontSize: 8,
    justifyContent: "center",
  },
  colRate: {
    width: "12%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    textAlign: "right",
    fontSize: 8,
    justifyContent: "center",
  },
  colPer: {
    width: "8%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    textAlign: "center",
    fontSize: 8,
    justifyContent: "center",
  },
  colAmount: {
    width: "18%",
    padding: 4,
    textAlign: "right",
    fontSize: 8,
    justifyContent: "center",
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 7,
    textTransform: "uppercase",
  },
  itemDescription: {
    fontWeight: "bold",
  },
  // Subtotal and total rows
  subtotalRow: {
    flexDirection: "row",
    minHeight: 30,
  },
  subtotalSpace: {
    width: "82%",
    borderRightWidth: 1,
    borderRightColor: "#374151",
    padding: 4,
  },
  subtotalAmount: {
    width: "18%",
    padding: 4,
    textAlign: "right",
    fontSize: 8,
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    fontWeight: "bold",
  },
  roundOffRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  roundOffLabel: {
    width: "82%",
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    textAlign: "right",
    fontSize: 8,
    fontStyle: "italic",
  },
  roundOffValue: {
    width: "18%",
    padding: 4,
    textAlign: "right",
    fontSize: 8,
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  totalLabel: {
    width: "62%",
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    textAlign: "right",
    fontSize: 10,
    fontWeight: "bold",
  },
  totalQty: {
    width: "12%",
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#374151",
    textAlign: "right",
    fontSize: 10,
    fontWeight: "bold",
  },
  totalSkip: {
    width: "8%",
    borderRightWidth: 1,
    borderRightColor: "#374151",
  },
  totalAmount: {
    width: "18%",
    padding: 6,
    textAlign: "right",
    fontSize: 10,
    fontWeight: "bold",
  },
  // Amount in words
  amountInWords: {
    borderTopWidth: 1,
    borderTopColor: "#374151",
    padding: 8,
  },
  amountLabel: {
    fontSize: 7,
    marginBottom: 3,
  },
  amountText: {
    fontSize: 10,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  // Footer section
  footerSection: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  bankDetailsSection: {
    width: "50%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#374151",
  },
  bankTitle: {
    fontSize: 8,
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 6,
  },
  bankRow: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 8,
  },
  bankLabel: {
    width: 70,
    color: "#6B7280",
  },
  bankValue: {
    flex: 1,
    fontWeight: "bold",
  },
  declarationSection: {
    marginTop: 12,
  },
  declarationTitle: {
    fontSize: 7,
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 3,
  },
  declarationText: {
    fontSize: 7,
    color: "#6B7280",
    lineHeight: 1.4,
  },
  signatureSection: {
    width: "50%",
    padding: 8,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  signatureTop: {
    textAlign: "right",
  },
  signatureFor: {
    fontSize: 8,
  },
  signatureCompany: {
    fontSize: 10,
    fontWeight: "bold",
  },
  signatureBottom: {
    marginTop: 40,
    alignItems: "flex-end",
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#9CA3AF",
    paddingTop: 4,
    paddingHorizontal: 20,
  },
  signatureText: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  // Footer text
  computerGenerated: {
    textAlign: "center",
    fontSize: 8,
    color: "#6B7280",
    marginTop: 10,
  },
})

interface InvoicePDFProps {
  invoice: Invoice & {
    clients?: Client
  }
  items: InvoiceItem[]
  client: Client | undefined
  companySettings: CompanySettings | undefined
}

function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ]

  if (num === 0) return "Zero"

  function convertLessThanThousand(n: number): string {
    if (n === 0) return ""
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
  }

  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const remainder = Math.floor(num % 1000)

  let result = ""
  if (crore > 0) result += convertLessThanThousand(crore) + " Crore "
  if (lakh > 0) result += convertLessThanThousand(lakh) + " Lakh "
  if (thousand > 0) result += convertLessThanThousand(thousand) + " Thousand "
  if (remainder > 0) result += convertLessThanThousand(remainder)

  return result.trim()
}

export function InvoicePDF({ invoice, items, client, companySettings }: InvoicePDFProps) {
  if (!invoice || !items || !client || !companySettings) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Error: Missing invoice data</Text>
        </Page>
      </Document>
    )
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.amount), 0)
  const roundOff = Math.round(subtotal) - subtotal
  const grandTotal = Math.round(subtotal)
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0)

  const amountInWords = numberToWords(grandTotal)
  const fullAmountInWords = `${amountInWords} Rupees Only`

  const upiPaymentUrl = companySettings.upi_id
    ? `upi://pay?pa=${companySettings.upi_id}&pn=${encodeURIComponent(companySettings.company_name)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.invoice_number}`)}`
    : ""

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>TAX INVOICE</Text>
        </View>

        {/* Main Grid */}
        <View style={styles.mainGrid}>
          {/* Top Section */}
          <View style={styles.topSection}>
            {/* Company and Buyer Details - Left */}
            <View style={styles.companySection}>
              {/* Company Details */}
              <View style={styles.companyDetailsTop}>
                <Text style={styles.companyName}>{companySettings.company_name || "COMPANY NAME"}</Text>
                <Text style={styles.companyText}>{companySettings.address || ""}</Text>
                {companySettings.gst_number && (
                  <Text style={styles.companyText}>GSTIN/UIN: {companySettings.gst_number}</Text>
                )}
                {companySettings.phone && <Text style={styles.companyText}>Contact: {companySettings.phone}</Text>}
                {companySettings.email && <Text style={styles.companyText}>E-Mail: {companySettings.email}</Text>}
              </View>

              {/* Buyer Details */}
              <View style={styles.buyerSection}>
                <Text style={styles.sectionLabel}>Buyer (Bill to)</Text>
                <Text style={styles.buyerName}>{client.name}</Text>
                <Text style={styles.buyerText}>
                  {client.address}
                  {"\n"}
                  {client.city}, {client.state}
                  {"\n"}
                  State Name: {client.state || "N/A"}
                  {"\n"}
                  Place of Supply: {client.state || "N/A"}
                  {"\n"}
                  Contact: {client.phone}
                </Text>
              </View>
            </View>

            {/* Invoice Details and QR - Right */}
            <View style={styles.rightSection}>
              {/* Invoice Details */}
              <View style={styles.invoiceDetailsRow}>
                <View style={styles.invoiceDetailCell}>
                  <Text style={styles.detailLabel}>Invoice No.</Text>
                  <Text style={styles.detailValue}>{invoice.invoice_number}</Text>
                </View>
                <View style={styles.invoiceDetailCellLast}>
                  <Text style={styles.detailLabel}>Dated</Text>
                  <Text style={styles.detailValue}>
                    {new Date(invoice.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>

              {/* QR Code Section */}
              <View style={styles.qrSection}>
                {upiPaymentUrl && (
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPaymentUrl)}`}
                    style={styles.qrImage}
                  />
                )}
              </View>

              {/* Terms of Delivery */}
              <View style={styles.termsSection}>
                <Text style={styles.termsLabel}>Terms of Delivery</Text>
              </View>
            </View>
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colSNo, styles.tableHeaderText]}>SI{"\n"}NO.</Text>
              <Text style={[styles.colDescription, styles.tableHeaderText]}>DESCRIPTION OF GOODS</Text>
              <Text style={[styles.colLocation, styles.tableHeaderText]}>LOCATION</Text>
              <Text style={[styles.colQuantity, styles.tableHeaderText]}>QUANTITY</Text>
              <Text style={[styles.colRate, styles.tableHeaderText]}>RATE</Text>
              <Text style={[styles.colPer, styles.tableHeaderText]}>PER</Text>
              <Text style={[styles.colAmount, styles.tableHeaderText]}>AMOUNT</Text>
            </View>

            {/* Table Rows */}
            {items.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={styles.colSNo}>{index + 1}</Text>
                <Text style={[styles.colDescription, styles.itemDescription]}>{item.description}</Text>
                <Text style={styles.colLocation}>{item.location || "-"}</Text>
                <Text style={styles.colQuantity}>{Number(item.quantity).toFixed(2)}</Text>
                <Text style={styles.colRate}>{Number(item.rate).toFixed(2)}</Text>
                <Text style={styles.colPer}>Pcs.</Text>
                <Text style={styles.colAmount}>{Number(item.amount).toFixed(2)}</Text>
              </View>
            ))}

            {/* Subtotal Row */}
            <View style={styles.subtotalRow}>
              <View style={styles.subtotalSpace}></View>
              <Text style={styles.subtotalAmount}>{subtotal.toFixed(2)}</Text>
            </View>

            {/* Round Off Row */}
            <View style={styles.roundOffRow}>
              <Text style={styles.roundOffLabel}>Round Off</Text>
              <Text style={styles.roundOffValue}>
                {roundOff >= 0 ? "" : "(-)"}
                {Math.abs(roundOff).toFixed(2)}
              </Text>
            </View>

            {/* Total Row */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalQty}></Text>
              <View style={styles.totalSkip}></View>
              <Text style={styles.totalAmount}>₹ {grandTotal.toLocaleString("en-IN")}.00</Text>
            </View>
          </View>

          {/* Amount in Words */}
          <View style={styles.amountInWords}>
            <Text style={styles.amountLabel}>Amount Chargeable (in words)</Text>
            <Text style={styles.amountText}>{fullAmountInWords}</Text>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            {/* Bank Details - Left */}
            <View style={styles.bankDetailsSection}>
              <View>
                <Text style={styles.bankTitle}>Bank Details</Text>
                {companySettings.bank_name && (
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Bank Name:</Text>
                    <Text style={styles.bankValue}>{companySettings.bank_name}</Text>
                  </View>
                )}
                {companySettings.bank_account && (
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>Account No:</Text>
                    <Text style={styles.bankValue}>{companySettings.bank_account}</Text>
                  </View>
                )}
                {companySettings.bank_ifsc && (
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>IFSC Code:</Text>
                    <Text style={styles.bankValue}>{companySettings.bank_ifsc}</Text>
                  </View>
                )}
                {companySettings.upi_id && (
                  <View style={styles.bankRow}>
                    <Text style={styles.bankLabel}>UPI ID:</Text>
                    <Text style={styles.bankValue}>{companySettings.upi_id}</Text>
                  </View>
                )}
              </View>

              <View style={styles.declarationSection}>
                <Text style={styles.declarationTitle}>Declaration:</Text>
                <Text style={styles.declarationText}>
                  We declare that this invoice shows the actual price of the goods described and that all particulars
                  are true and correct.
                </Text>
              </View>
            </View>

            {/* Signature Section - Right */}
            <View style={styles.signatureSection}>
              <View style={styles.signatureTop}>
                <Text style={styles.signatureFor}>for </Text>
                <Text style={styles.signatureCompany}>{companySettings.company_name}</Text>
              </View>

              <View style={styles.signatureBottom}>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureText}>AUTHORIZED SIGNATORY</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Computer Generated Text */}
        <Text style={styles.computerGenerated}>This is a Computer Generated Invoice</Text>
      </Page>
    </Document>
  )
}
