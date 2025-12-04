import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Calendar,
  Filter,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import "./Payments.css";
import { paymentsAPI } from "../../services/api";

const Payments = ({ user }) => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [showDetails, setShowDetails] = useState({});
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    if (user && !user.isGuest) {
      loadPayments();
    }
  }, [user, pagination.page, filters.status]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentsAPI.getUserPayments(
        user.id,
        filters.status,
        pagination.page,
        pagination.limit
      );
      setPayments(data.payments);
      setStats(data.stats);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (paymentId) => {
    if (!window.confirm("Marcar este pagamento como pago?")) return;

    setProcessingPayment(paymentId);
    try {
      await paymentsAPI.markAsPaid(paymentId, {
        method: "PIX",
        amount: payments.find((p) => p.id === paymentId)?.amount,
      });
      alert("Pagamento marcado como pago com sucesso!");
      loadPayments();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      alert("Erro ao marcar pagamento como pago.");
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "status" || key === "search") {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pendente: (
        <span className="status-badge status-pending">
          <Clock size={12} /> Pendente
        </span>
      ),
      atrasado: (
        <span className="status-badge status-late">
          <AlertCircle size={12} /> Atrasado
        </span>
      ),
      pago: (
        <span className="status-badge status-paid">
          <CheckCircle size={12} /> Pago
        </span>
      ),
      "vence hoje": (
        <span className="status-badge status-due-today">
          <CalendarDays size={12} /> Vence Hoje
        </span>
      ),
    };
    return (
      badges[status] || (
        <span className="status-badge status-pending">
          <Clock size={12} /> {status}
        </span>
      )
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const toggleDetails = (paymentId) => {
    setShowDetails((prev) => ({
      ...prev,
      [paymentId]: !prev[paymentId],
    }));
  };

  const handleExport = () => {
    const csvContent = [
      [
        "ID",
        "Photocard",
        "Valor",
        "Pago",
        "Pendente",
        "Vencimento",
        "Status",
        "CEG",
        "Seller",
      ],
      ...payments.map((p) => [
        p.payment_id || p.id,
        p.photocard_name,
        formatCurrency(p.amount),
        formatCurrency(p.paid_amount),
        formatCurrency(p.pending_amount),
        formatDate(p.due_date),
        p.status,
        p.ceg_name,
        p.seller,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pagamentos_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (user?.isGuest) {
    return (
      <div className="payments-container">
        <div className="payments-header">
          <h1>
            <CreditCard size={28} />
            Pagamentos
          </h1>
          <p className="guest-message">
            Modo Visitante: Faça login para acessar seus pagamentos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="payments-container">
      <div className="payments-header">
        <div className="header-left">
          <h1>
            <CreditCard size={28} />
            Pagamentos
          </h1>
          <p className="subtitle">
            Gerencie todos os seus pagamentos em um só lugar
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={18} />
            Exportar CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="payments-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total de Pagamentos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pendentes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon paid">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.paid}</h3>
            <p>Pagos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amount">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.pendingAmount)}</h3>
            <p>Valor Pendente</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="payments-filters">
        <div className="filter-group">
          <div className="filter-item">
            <Filter size={16} />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="filter-select"
            >
              <option value="">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="atrasado">Atrasados</option>
              <option value="pago">Pagos</option>
            </select>
          </div>
          <div className="filter-item">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar por photocard ou CEG..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
        <div className="date-filters">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="date-input"
            placeholder="Data inicial"
          />
          <span>até</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="date-input"
            placeholder="Data final"
          />
        </div>
      </div>

      {/* Tabela de Pagamentos */}
      <div className="payments-table-container">
        {loading ? (
          <div className="loading-payments">
            <div className="spinner"></div>
            <p>Carregando pagamentos...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-payments">
            <CreditCard size={48} />
            <h3>Nenhum pagamento encontrado</h3>
            <p>Não há pagamentos com os filtros aplicados.</p>
          </div>
        ) : (
          <>
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Detalhes</th>
                  <th>Photocard</th>
                  <th>Valor Total</th>
                  <th>Valor Pago</th>
                  <th>Pendente</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th>CEG</th>
                  <th>Seller</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <React.Fragment key={payment.id}>
                    <tr>
                      <td>
                        <button
                          className="btn-details"
                          onClick={() => toggleDetails(payment.id)}
                          title="Ver detalhes"
                        >
                          {showDetails[payment.id] ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="payment-photocard">
                          {payment.photocard_image && (
                            <img
                              src={payment.photocard_image}
                              alt={payment.photocard_name}
                              className="photocard-thumb"
                            />
                          )}
                          <span className="photocard-name">
                            {payment.photocard_name}
                          </span>
                        </div>
                      </td>
                      <td className="amount-cell">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="amount-cell paid">
                        {formatCurrency(payment.paid_amount)}
                      </td>
                      <td className="amount-cell pending">
                        {formatCurrency(payment.pending_amount)}
                        {payment.late_fee > 0 && (
                          <span className="late-fee">
                            +{formatCurrency(payment.late_fee)}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="due-date">
                          <Calendar size={14} />
                          {formatDate(payment.due_date)}
                        </div>
                      </td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td>{payment.ceg_name || "-"}</td>
                      <td>{payment.seller}</td>
                      <td>
                        {payment.status !== "pago" && (
                          <button
                            className="btn-mark-paid"
                            onClick={() => handleMarkAsPaid(payment.id)}
                            disabled={processingPayment === payment.id}
                          >
                            {processingPayment === payment.id ? (
                              "Processando..."
                            ) : (
                              <>
                                <CheckCircle size={16} />
                                Marcar como Pago
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                    {showDetails[payment.id] && (
                      <tr className="details-row">
                        <td colSpan="10">
                          <div className="payment-details">
                            <div className="detail-section">
                              <h4>Informações do Pagamento</h4>
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <strong>ID:</strong>{" "}
                                  {payment.payment_id || payment.id}
                                </div>
                                <div className="detail-item">
                                  <strong>Tipo:</strong> {payment.payment_type}
                                </div>
                                <div className="detail-item">
                                  <strong>Método:</strong>{" "}
                                  {payment.payment_method || "Não definido"}
                                </div>
                                <div className="detail-item">
                                  <strong>Data de Criação:</strong>{" "}
                                  {payment.created_at
                                    ? formatDate(payment.created_at)
                                    : "-"}
                                </div>
                              </div>
                            </div>
                            {payment.notes && (
                              <div className="detail-section">
                                <h4>Observações</h4>
                                <p className="notes">{payment.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>
                <span className="pagination-info">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Próxima
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;
