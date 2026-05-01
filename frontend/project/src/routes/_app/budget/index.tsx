import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Divider,
  Chip,
  Image,
} from "@heroui/react";
import {
  IoWalletOutline,
  IoFastFoodOutline,
  IoCarOutline,
  IoBagHandleOutline,
  IoBedOutline,
  IoTicketOutline,
  IoEllipsisHorizontalCircleOutline,
  IoTrashOutline,
  IoAddCircleOutline,
  IoCameraOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import { motion } from "framer-motion";

export const Route = createFileRoute('/_app/budget/')({
  component: RouteComponent,
})

type Category =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Accommodation"
  | "Activities"
  | "Other";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  receiptPhoto?: string;
}

const CATEGORIES: { label: Category; icon: any; color: "warning" | "primary" | "secondary" | "success" | "danger" | "default" }[] = [
  { label: "Food", icon: IoFastFoodOutline, color: "warning" },
  { label: "Transport", icon: IoCarOutline, color: "primary" },
  { label: "Shopping", icon: IoBagHandleOutline, color: "secondary" },
  { label: "Accommodation", icon: IoBedOutline, color: "success" },
  { label: "Activities", icon: IoTicketOutline, color: "danger" },
  { label: "Other", icon: IoEllipsisHorizontalCircleOutline, color: "default" },
];

const STORAGE_KEY = "travel-planner-budget-expenses";
const BUDGET_STORAGE_KEY = "travel-planner-total-budget";

function RouteComponent() {
  // State definitions
  const [totalBudget, setTotalBudget] = useState<number>(() => {
    const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
    return stored ? parseFloat(stored) : 5000;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Form drafts
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);

  // Filter state
  const [filterDate, setFilterDate] = useState<string>("All");

  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(expenses.map((e) => e.date))).sort();
    return ["All", ...dates];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return filterDate === "All"
      ? expenses
      : expenses.filter((e) => e.date === filterDate);
  }, [expenses, filterDate]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    CATEGORIES.forEach((c) => (totals[c.label] = 0));
    filteredExpenses.forEach((e) => {
      if (totals[e.category] !== undefined) totals[e.category] += e.amount;
    });
    return totals;
  }, [filteredExpenses]);

  const COLOR_MAP: Record<string, string> = {
    warning: "#f5a524",
    primary: "#006fee",
    secondary: "#7828c8",
    success: "#17c964",
    danger: "#f31260",
    default: "#a1a1aa",
  };

  const chartData = useMemo(() => {
    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    let cumulative = 0;
    return CATEGORIES.map((cat) => {
      const value = categoryTotals[cat.label];
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const strokeDasharray = `${percentage} ${100 - percentage}`;
      const strokeDashoffset = 25 - cumulative;
      cumulative += percentage;
      return { ...cat, value, percentage, strokeDasharray, strokeDashoffset, color: cat.color };
    }).filter((c) => c.value > 0);
  }, [categoryTotals]);

  const filteredTotalSpent = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredExpenses]);

  // Sync with local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(BUDGET_STORAGE_KEY, totalBudget.toString());
  }, [totalBudget]);

  // Real-time calculations
  const totalSpent = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const remainingBudget = totalBudget - totalSpent;
  const progressPercentage = Math.min((totalSpent / totalBudget) * 100, 100);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setReceiptPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount),
      category,
      date,
      receiptPhoto: receiptPhoto || undefined,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setTitle("");
    setAmount("");
    setReceiptPhoto(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((ex) => ex.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col gap-8 p-6 max-w-6xl mx-auto w-full pb-20">
      {/* Page Header */}
      <section className="mt-8 text-center flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight italic">
            Budget <span className="text-primary not-italic">Tracker</span>
          </h1>
          <p className="text-default-500 mt-2 max-w-lg mx-auto">
            Log your trip expenses and track your remaining budget in real-time.
          </p>
        </motion.div>
      </section>

      {/* Dashboard Summary Cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-background shadow-md border-none rounded-3xl">
          <CardBody className="flex flex-col gap-2 p-6">
            <div className="flex items-center justify-between">
              <p className="text-default-500 font-medium">Total Budget</p>
              <IoWalletOutline size={24} className="text-primary" />
            </div>
            <Input
              type="number"
              variant="underlined"
              value={totalBudget.toString()}
              onValueChange={(v) => setTotalBudget(parseFloat(v) || 0)}
              classNames={{
                input: "text-3xl font-black text-foreground",
                inputWrapper: "px-0 border-b-2 border-primary/20",
              }}
              startContent={<span className="text-2xl font-bold text-default-400">$</span>}
            />
          </CardBody>
        </Card>

        <Card className="bg-danger-50 shadow-md border-none rounded-3xl">
          <CardBody className="flex flex-col gap-2 p-6">
            <div className="flex items-center justify-between">
              <p className="text-danger-600 font-medium">Total Spent</p>
              <Chip color="danger" variant="flat" size="sm" className="font-bold">
                {progressPercentage.toFixed(1)}%
              </Chip>
            </div>
            <h2 className="text-3xl font-black text-danger-600">
              <span className="text-danger-400">$</span>
              {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </CardBody>
        </Card>

        <Card className="bg-success-50 shadow-md border-none rounded-3xl">
          <CardBody className="flex flex-col gap-2 p-6">
            <div className="flex items-center justify-between">
              <p className="text-success-600 font-medium">Remaining</p>
              <Chip color={remainingBudget < 0 ? "danger" : "success"} variant="shadow" size="sm" className="font-bold">
                {remainingBudget < 0 ? "Over Budget" : "On Track"}
              </Chip>
            </div>
            <h2 className={`text-3xl font-black ${remainingBudget < 0 ? "text-danger-600" : "text-success-600"}`}>
              <span className="opacity-70">$</span>
              {remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </CardBody>
        </Card>
      </motion.section>

      <Divider className="my-2" />

      {/* Budget Visualization */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-2xl font-bold italic">Graphical Breakdown</h3>
          <Select
            label="Filter by Date"
            selectedKeys={[filterDate]}
            onSelectionChange={(keys) => setFilterDate(Array.from(keys)[0] as string)}
            variant="bordered"
            className="w-full sm:w-64"
            size="sm"
          >
            {uniqueDates.map((d) => (
              <SelectItem key={d} textValue={d === "All" ? "Entire Trip" : d}>
                {d === "All" ? "Entire Trip" : d}
              </SelectItem>
            ))}
          </Select>
        </div>

        <Card className="bg-background shadow-lg border-none rounded-3xl p-6">
          <CardBody className="flex flex-col md:flex-row items-center gap-12">
            {/* SVG Donut Chart */}
            <div className="relative w-64 h-64 shrink-0">
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="overflow-visible">
                {/* Background Circle */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549431"
                  fill="transparent"
                  stroke="#e4e4e7"
                  strokeWidth="6"
                />
                {/* Data Segments */}
                {chartData.map((data, index) => (
                  <motion.circle
                    key={data.label}
                    cx="21"
                    cy="21"
                    r="15.91549431"
                    fill="transparent"
                    stroke={COLOR_MAP[data.color]}
                    strokeWidth="6"
                    strokeDasharray={data.strokeDasharray}
                    strokeDashoffset={data.strokeDashoffset}
                    initial={{ strokeDasharray: "0 100" }}
                    animate={{ strokeDasharray: data.strokeDasharray }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                ))}
              </svg>
              {/* Inner Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-default-500 text-sm font-medium">Spent</span>
                <span className="text-2xl font-black text-foreground">
                  ${filteredTotalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => {
                const value = categoryTotals[cat.label];
                if (value === 0 && filterDate !== "All") return null;
                const percentage = filteredTotalSpent > 0 ? ((value / filteredTotalSpent) * 100).toFixed(1) : "0.0";
                
                return (
                  <div key={cat.label} className="flex items-center gap-4 p-3 rounded-2xl bg-default-50">
                    <div className={`p-3 rounded-full bg-${cat.color}/20 text-${cat.color}`}>
                      <cat.icon size={20} />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-sm">{cat.label}</span>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs text-default-500">{percentage}%</span>
                        <span className="font-black text-sm">
                          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </motion.section>

      <Divider className="my-2" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add Expense Form */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          <h3 className="text-2xl font-bold italic">Log Expense</h3>
          <Card className="bg-background shadow-lg border-none rounded-3xl p-2">
            <CardBody>
              <form onSubmit={handleAddExpense} className="flex flex-col gap-5">
                <Input
                  label="Description"
                  placeholder="Dinner, Taxi, Souvenirs..."
                  value={title}
                  onValueChange={setTitle}
                  variant="bordered"
                  isRequired
                />
                <Input
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onValueChange={setAmount}
                  variant="bordered"
                  startContent={<span className="text-default-400 text-sm">$</span>}
                  isRequired
                  step="0.01"
                />
                <Select
                  label="Category"
                  selectedKeys={[category]}
                  onSelectionChange={(keys) => setCategory(Array.from(keys)[0] as Category)}
                  variant="bordered"
                  isRequired
                >
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.label} textValue={cat.label}>
                      <div className="flex items-center gap-2">
                        <cat.icon className={`text-${cat.color}`} size={18} />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  onValueChange={setDate}
                  variant="bordered"
                  isRequired
                />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-default-700">Receipt Photo (Optional)</span>
                  {receiptPhoto ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-md border border-divider">
                      <img src={receiptPhoto} alt="Receipt preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 text-danger bg-white/80 rounded-full"
                        onClick={() => setReceiptPhoto(null)}
                      >
                        <IoCloseCircleOutline size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-divider hover:border-primary hover:text-primary cursor-pointer transition-colors text-default-400 bg-default-50">
                      <IoCameraOutline size={28} />
                      <span className="text-xs font-bold mt-2">Click to Upload Receipt</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  )}
                </div>
                <Button type="submit" color="primary" className="font-bold mt-2 shadow-lg" startContent={<IoAddCircleOutline size={20} />}>
                  Add Expense
                </Button>
              </form>
            </CardBody>
          </Card>
        </motion.section>

        {/* Expenses List */}
        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-8 flex flex-col gap-6"
        >
          <h3 className="text-2xl font-bold italic">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            {expenses.length === 0 ? (
              <div className="bg-default-50 border border-dashed border-default-200 rounded-3xl p-12 text-center text-default-500">
                No expenses logged yet. Start by adding one!
              </div>
            ) : (
              expenses.map((expense) => {
                const catInfo = CATEGORIES.find((c) => c.label === expense.category) || CATEGORIES[5];
                const Icon = catInfo.icon;

                return (
                  <Card key={expense.id} className="bg-background shadow-sm border border-divider rounded-2xl">
                    <CardBody className="flex flex-row items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-${catInfo.color}/20 text-${catInfo.color}`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-lg">{expense.title}</span>
                          <span className="text-default-400 text-sm">
                            {expense.date} • {expense.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                      {expense.receiptPhoto && (
                        <div className="hidden sm:block w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-divider shrink-0">
                          <Image src={expense.receiptPhoto} alt="Receipt" className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" onClick={() => window.open(expense.receiptPhoto, '_blank')} removeWrapper />
                        </div>
                      )}
                        <span className="font-black text-lg text-foreground">
                          ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <Button
                          isIconOnly
                          variant="light"
                          color="danger"
                          onPress={() => handleDeleteExpense(expense.id)}
                          aria-label="Delete expense"
                        >
                          <IoTrashOutline size={20} />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
