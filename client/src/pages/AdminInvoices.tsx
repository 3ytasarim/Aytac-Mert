import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, CreditCard, User, Calendar, Receipt, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import type { Invoice } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminInvoices() {
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['/api/admin/invoices'],
    retry: false,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-red-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Faturalar yüklenemedi</h3>
            <p className="text-gray-500">Bir hata oluştu. Lütfen sayfayı yenileyin.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = (invoices as any[])?.reduce((sum, invoice) => sum + invoice.amount, 0) || 0;
  const totalInvoices = (invoices as any[])?.length || 0;
  const paidInvoices = (invoices as any[])?.filter(inv => inv.status === 'paid').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8" data-testid="admin-invoices-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" data-testid="button-back-admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Faturalar</h1>
                <p className="text-gray-600">Tüm ödeme kayıtları ve fatura detayları</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Toplam Gelir</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Toplam Fatura</p>
                    <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Ödenmiş</p>
                    <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Fatura Listesi
            </CardTitle>
            <CardDescription>
              Tüm öğrenci ödemeleri ve fatura detayları
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices && (invoices as any[]).length > 0 ? (
              <div className="space-y-4" data-testid="invoices-list">
                <AnimatePresence>
                  {(invoices as any[]).map((invoice: any, index: number) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300"
                      data-testid={`invoice-card-${invoice.id}`}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Student Info */}
                        <div className="lg:col-span-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate" data-testid={`text-student-name-${invoice.id}`}>
                                {invoice.studentName}
                              </h3>
                              <p className="text-sm text-gray-500 truncate" data-testid={`text-tc-number-${invoice.id}`}>
                                T.C.: {invoice.tcNumber}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Course Info */}
                        <div className="lg:col-span-3">
                          <div className="space-y-1">
                            <h4 className="font-medium text-gray-900" data-testid={`text-course-name-${invoice.id}`}>
                              {invoice.courseName}
                            </h4>
                            <p className="text-sm text-gray-500">Eğitim Kursu</p>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="lg:col-span-2">
                          <div className="text-right lg:text-left">
                            <p className="text-lg font-bold text-gray-900" data-testid={`text-amount-${invoice.id}`}>
                              {formatPrice(invoice.amount)}
                            </p>
                            <p className="text-sm text-gray-500">{invoice.paymentMethod === 'bank_transfer' ? 'Havale/EFT' : 'Online'}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="lg:col-span-2">
                          <div className="flex justify-center lg:justify-start">
                            <Badge 
                              variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                              className={`${
                                invoice.status === 'paid' 
                                  ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                              data-testid={`badge-status-${invoice.id}`}
                            >
                              {invoice.status === 'paid' ? 'Ödeme Yapıldı' : 'Beklemede'}
                            </Badge>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center text-sm text-gray-500 justify-center lg:justify-end">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span data-testid={`text-date-${invoice.id}`}>
                              {formatDate(invoice.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500" data-testid="no-invoices">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="font-semibold mb-2">Henüz fatura bulunmuyor</h3>
                <p className="text-sm">Öğrenciler ödeme yaptığında burada görünecektir.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}