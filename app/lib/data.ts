import { formatCurrency } from "./utils";
import prisma from "./config/prisma";

// 1. Fetch Revenue Data
export async function fetchRevenue() {
  try {
    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const revenue = await prisma.revenue.findMany();
    console.log("Data fetch completed after 3 seconds.");

    return revenue;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

// 2. Fetch Latest Invoices
export async function fetchLatestInvoices() {
  try {
    const invoices = await prisma.invoices.findMany({
      take: 5,
      orderBy: {
        date: "desc", // Sorting by the latest date
      },
      include: {
        customer: {
          select: {
            name: true,
            imageUrl: true,
            email: true,
          },
        },
      },
    });

    const latestInvoices = invoices.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

// 3. Fetch Summary Card Data (Invoice count, Customer count, Paid & Pending totals)
export async function fetchCardData() {
  try {
    // Use Prisma to fetch the counts and amounts
    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      prisma.invoices.count(),
      prisma.customers.count(),
      prisma.invoices.aggregate({
        _sum: {
          amount: true,
        },
        _count: true,
        where: {
          status: { in: ["paid", "pending"] },
        },
      }),
    ]);

    // Calculate the totals for 'paid' and 'pending' statuses
    const paidInvoices = await prisma.invoices.aggregate({
      _sum: { amount: true },
      where: { status: "paid" },
    });
    const pendingInvoices = await prisma.invoices.aggregate({
      _sum: { amount: true },
      where: { status: "pending" },
    });

    // Format the results
    const numberOfInvoices = invoiceCount ?? 0;
    const numberOfCustomers = customerCount ?? 0;
    const totalPaidInvoices = formatCurrency(paidInvoices._sum.amount ?? 0);
    const totalPendingInvoices = formatCurrency(
      pendingInvoices._sum.amount ?? 0
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}
// 4. Fetch Filtered Invoices
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const ITEMS_PER_PAGE = 10; // Adjust this as per your requirements
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.invoices.findMany({
      skip: offset,
      take: ITEMS_PER_PAGE,
      where: {
        OR: [
          {
            customer: {
              name: {
                contains: query,
                mode: "insensitive", // Case-insensitive search
              },
            },
          },
          {
            customer: {
              email: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            amount: {
              equals: Number(query) || undefined, // Search by amount (numeric values only)
            },
          },
          {
            status: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        date: "desc", // Sort by date descending
      },
      select: {
        id: true,
        amount: true,
        date: true,
        status: true,
        customer: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    return invoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

// 6. Fetch Invoice by ID
export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoices.findUnique({
      where: { id },
      include: {
        customer: true, // Include customer data
      },
    });

    if (invoice) {
      return {
        ...invoice,
        amount: invoice.amount / 100, // Convert amount from cents to dollars
      };
    }

    return null;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

// 7. Fetch All Customers
export async function fetchCustomers() {
  try {
    const customers = await prisma.customers.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return customers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch all customers.");
  }
}

// 8. Fetch Filtered Customers
export async function fetchFilteredCustomers(query: string) {
  try {
    const customers = await prisma.customers.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        invoices: {
          where: {
            OR: [{ status: "pending" }, { status: "paid" }],
          },
          select: {
            status: true,
            amount: true,
          },
        },
      },
    });

    const filteredCustomers = customers.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(
        customer.invoices
          .filter((invoice) => invoice.status === "pending")
          .reduce((acc, invoice) => acc + invoice.amount, 0)
      ),
      total_paid: formatCurrency(
        customer.invoices
          .filter((invoice) => invoice.status === "paid")
          .reduce((acc, invoice) => acc + invoice.amount, 0)
      ),
    }));

    return filteredCustomers;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}

export async function fetchInvoicesPages(query: string) {
  const ITEMS_PER_PAGE = 10; // Adjust this value or import it from a constants file

  try {
    // Count the total invoices matching the query
    const count = 10; //await prisma.invoices.count({
    //   where: {
    //     OR: [
    //       // { customer: { name: { contains: query, mode: "insensitive" } } },
    //       // { customer: { email: { contains: query, mode: "insensitive" } } },
    //       { amount: { equals: Number(query) || undefined } }, // Converts query to number if possible
    //       { date: { equals: new Date(query) || undefined } }, // Converts query to date if valid
    //       { status: { contains: query, mode: "insensitive" } },
    //     ],
    //   },
    // });

    // Calculate total pages
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}
