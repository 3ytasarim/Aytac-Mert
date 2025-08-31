import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import StudentDashboard from "@/pages/student-dashboard";
import CourseViewer from "@/pages/CourseViewer";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminContacts from "@/pages/AdminContacts";
import AdminCourses from "@/pages/AdminCourses";
import AdminAddCourse from "@/pages/AdminAddCourse";
import AdminCourseEdit from "@/pages/AdminCourseEdit";
import AdminAddStudent from "@/pages/AdminAddStudent";
import AdminInvoices from "@/pages/AdminInvoices";
import AdminStudentContacts from "@/pages/AdminStudentContacts";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";
import ResetPassword from "@/pages/ResetPassword";
import { SocialIcons } from "@/components/SocialIcons";
import { ScrollUpButton } from "@/components/ScrollUpButton";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          {user?.role === "admin" ? (
            <>
              <Route path="/" component={Landing} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/students" component={AdminUsers} />
              <Route path="/admin/students/add" component={AdminAddStudent} />
              <Route path="/admin/students/active" component={AdminUsers} />
              <Route path="/admin/students/import" component={AdminUsers} />
              <Route path="/admin/contacts" component={AdminContacts} />
              <Route path="/admin/courses" component={AdminCourses} />
              <Route path="/admin/courses/add" component={AdminAddCourse} />
              <Route path="/admin/courses/edit" component={AdminCourseEdit} />
              <Route path="/admin/courses/:id/lessons" component={AdminCourseEdit} />
              <Route path="/admin/students/add" component={AdminAddStudent} />
              <Route path="/admin/categories" component={AdminContacts} />
              <Route path="/admin/invoices" component={AdminInvoices} />
              <Route path="/admin/student-contacts" component={AdminStudentContacts} />
              <Route path="/admin/reports" component={AdminContacts} />
              <Route path="/admin/settings" component={AdminContacts} />
            </>
          ) : (
            <>
              <Route path="/" component={Landing} />
              <Route path="/dashboard" component={StudentDashboard} />
              <Route path="/course/:id" component={CourseViewer} />
            </>
          )}
          <Route path="/hakkimizda" component={About} />
          <Route path="/iletisim" component={Contact} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/hakkimizda" component={About} />
          <Route path="/iletisim" component={Contact} />
        </>
      )}
      <Route path="/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <SocialIcons />
        <ScrollUpButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
