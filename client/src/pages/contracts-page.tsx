import { Layout } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown } from "lucide-react";

export default function ContractsPage() {
  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Contracts</h1>
        </div>
        
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Contracts & Agreements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <FileDown className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Contracts Available</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                When negotiations are completed successfully, contracts will be generated and displayed here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}