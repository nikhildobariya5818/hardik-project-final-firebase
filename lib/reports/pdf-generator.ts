import { jsPDF } from "jspdf"
import "jspdf-autotable"
import type { Client, Order, Payment } from "@/lib/firebase/types"

interface ReportData {
  orders: Order[]
  payments: Payment[]
  clients: Client[]
}

interface ReportFilters {
  month?: string
  clientName?: string
  material?: string
}

const COLORS = {
  primary: [79, 70, 229], // indigo
  success: [34, 197, 94], // green
  warning: [217, 119, 6], // orange
  muted: [107, 114, 128], // gray
  white: [255, 255, 255],
  black: [0, 0, 0],
}

function addHeader(doc: InstanceType<typeof jsPDF>, title: string, subtitle?: string, filters?: ReportFilters) {
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, 210, 35, "F")

  doc.setTextColor(...COLORS.white)
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(title, 15, 22)

  if (subtitle) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(subtitle, 15, 28)
  }

  const yPos = 40
  doc.setTextColor(...COLORS.black)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")

  if (filters) {
    const filterTexts: string[] = []
    if (filters.month && filters.month !== "all") {
      const [year, monthNum] = filters.month.split("-")
      const monthName = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1).toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      })
      filterTexts.push(`Month: ${monthName}`)
    }
    if (filters.clientName) {
      filterTexts.push(`Client: ${filters.clientName}`)
    }
    if (filters.material) {
      filterTexts.push(`Material: ${filters.material}`)
    }

    if (filterTexts.length > 0) {
      doc.text(`Filters: ${filterTexts.join(" | ")}`, 15, yPos)
    }
  }

  doc.setTextColor(...COLORS.muted)
  doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 15, yPos + 5)

  return yPos + 15
}

function addSummaryStats(
  doc: InstanceType<typeof jsPDF>,
  yPos: number,
  stats: { label: string; value: string; color?: number[] }[],
) {
  const boxWidth = 45
  const boxHeight = 25
  const gap = 3
  let xPos = 15

  stats.forEach((stat) => {
    doc.setFillColor(240, 240, 240)
    doc.rect(xPos, yPos, boxWidth, boxHeight, "F")

    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.muted)
    doc.text(stat.label, xPos + 2, yPos + 6)

    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...(stat.color || COLORS.primary))
    doc.text(stat.value, xPos + 2, yPos + 16)

    xPos += boxWidth + gap
  })

  return yPos + boxHeight + 10
}

export async function generateReportPDF(data: ReportData, reportType: string, filters?: ReportFilters) {
  const doc = new jsPDF()

  let yPos = 0

  switch (reportType) {
    case "overview": {
      const totalRevenue = data.orders.reduce((sum, o) => sum + Number(o.total), 0)
      const totalPayments = data.payments.reduce((sum, p) => sum + Number(p.amount), 0)
      const pendingAmount = totalRevenue - totalPayments

      yPos = addHeader(doc, "Reports & Analytics", "Business Performance Overview", filters)

      const stats = [
        { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: COLORS.success },
        { label: "Total Collected", value: `₹${totalPayments.toLocaleString("en-IN")}` },
        { label: "Pending Amount", value: `₹${pendingAmount.toLocaleString("en-IN")}`, color: COLORS.warning },
        { label: "Deliveries", value: data.orders.length.toString() },
      ]

      yPos = addSummaryStats(doc, yPos, stats)

      // Material-wise table
      const materialStats = ["RETI", "KAPCHI", "GSB", "RABAR"].map((material) => {
        const materialOrders = data.orders.filter((o) => o.material === material)
        return {
          material,
          deliveries: materialOrders.length,
          weight: materialOrders.reduce((sum, o) => sum + Number(o.weight), 0).toFixed(2),
          amount: materialOrders.reduce((sum, o) => sum + Number(o.total), 0),
        }
      })
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Material", "Deliveries", "Weight (MT)", "Amount"]],
        body: materialStats.map((m) => [
          m.material,
          m.deliveries.toString(),
          m.weight,
          `₹${m.amount.toLocaleString("en-IN")}`,
        ]),
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: COLORS.black,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 15, right: 15 },
      })

      break
    }

    case "client-wise": {
      yPos = addHeader(doc, "Client-Wise Report", "Detailed breakdown by client", filters)

      const reportData = data.clients.map((client) => {
        const clientOrders = data.orders.filter((o) => o.client_id === client.id)
        const clientPayments = data.payments.filter((p) => p.client_id === client.id)

        const totalOrders = clientOrders.reduce((sum, o) => sum + Number(o.total), 0)
        const totalPayments = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0)
        const pendingBalance = client.opening_balance + totalOrders - totalPayments

        return [
          client.name,
          clientOrders.length.toString(),
          clientOrders.reduce((sum, o) => sum + Number(o.weight), 0).toFixed(2),
          `₹${totalOrders.toLocaleString("en-IN")}`,
          `₹${totalPayments.toLocaleString("en-IN")}`,
          `₹${pendingBalance.toLocaleString("en-IN")}`,
        ]
      })
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Client", "Orders", "Weight", "Total Orders", "Payments", "Pending"]],
        body: reportData,
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 15, right: 15 },
      })

      break
    }

    case "material-wise": {
      yPos = addHeader(doc, "Material-Wise Report", "Breakdown by material type", filters)

      const materialStats = ["RETI", "KAPCHI", "GSB", "RABAR"]
        .map((material) => {
          const materialOrders = data.orders.filter((o) => o.material === material)
          return {
            material,
            deliveries: materialOrders.length,
            weight: materialOrders.reduce((sum, o) => sum + Number(o.weight), 0).toFixed(2),
            avgRate:
              materialOrders.length > 0
                ? (materialOrders.reduce((sum, o) => sum + Number(o.rate), 0) / materialOrders.length).toFixed(2)
                : "0",
            amount: materialOrders.reduce((sum, o) => sum + Number(o.total), 0),
          }
        })
        .filter((s) => s.deliveries > 0)

      const reportData = materialStats.map((m) => [
        m.material,
        m.deliveries.toString(),
        `${m.weight} MT`,
        `₹${m.avgRate}`,
        `₹${m.amount.toLocaleString("en-IN")}`,
      ])
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Material", "Deliveries", "Weight", "Avg Rate", "Total Amount"]],
        body: reportData,
        headStyles: {
          fillColor: COLORS.primary,
          textColor: COLORS.white,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 15, right: 15 },
      })

      break
    }

    case "pending-payments": {
      yPos = addHeader(doc, "Pending Payments Report", "Clients with outstanding balances", filters)

      const pendingData = data.clients
        .map((client) => {
          const clientOrders = data.orders.filter((o) => o.client_id === client.id)
          const clientPayments = data.payments.filter((p) => p.client_id === client.id)

          const totalOrders = clientOrders.reduce((sum, o) => sum + Number(o.total), 0)
          const totalPayments = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0)
          const pendingBalance = client.opening_balance + totalOrders - totalPayments

          return {
            client,
            totalOrders,
            totalPayments,
            pendingBalance,
          }
        })
        .filter((d) => d.pendingBalance > 0)
        .sort((a, b) => b.pendingBalance - a.pendingBalance)

      const reportData = pendingData.map((row) => [
        row.client.name,
        row.client.city,
        `₹${row.totalOrders.toLocaleString("en-IN")}`,
        `₹${row.totalPayments.toLocaleString("en-IN")}`,
        `₹${row.pendingBalance.toLocaleString("en-IN")}`,
      ])
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Client", "City", "Total Orders", "Payments", "Pending Balance"]],
        body: reportData,
        headStyles: {
          fillColor: COLORS.warning,
          textColor: COLORS.white,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 15, right: 15 },
      })

      break
    }
  }

  const fileName = `Report_${reportType}_${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}
