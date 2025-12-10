import React, { useState, useMemo } from "react";
import { 
  Search, 
  FlaskConical, 
  Building2, 
  TestTube2, 
  Activity, 
  Info, 
  Filter,
  Stethoscope,
  ShoppingCart,
  AlertTriangle,
  X,
  CheckCircle2,
  Thermometer,
  Clock,
  FileJson
} from "lucide-react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Badge } from "./components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { Checkbox } from "./components/ui/checkbox";
import { ScrollArea } from "./components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Label } from "./components/ui/label";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";

// --- Types ---
interface ServiceDefinition {
  id: string;
  name: string;
  code: string; // LOINC
  laboratory: string;
  specimen: string;
  category: string;
  status: "active" | "inactive" | "unavailable";
  // New Knowledge Base Fields
  description: string;
  containerType: string;
  containerColor: string; // hex code
  patientPrep: string;
  stability: string;
  referenceRange: { gender: string; range: string }[];
}

// --- Mock Data ---
const MOCK_DATA: ServiceDefinition[] = [
  {
    id: "1",
    name: "Morfologia krwi z rozmazem automatycznym",
    code: "LOINC: 57021-8",
    laboratory: "Diagnostyka Łódź - Centrum",
    specimen: "Krew żylna (EDTA)",
    category: "Hematologia",
    status: "active",
    description: "Podstawowe badanie diagnostyczne oceniające układ czerwonokrwinkowy, białokrwinkowy oraz płytki krwi. Umożliwia rozpoznanie niedokrwistości, infekcji, zaburzeń krzepnięcia i innych chorób hematologicznych.",
    containerType: "Probówka z EDTA",
    containerColor: "#8b5cf6", // Violet
    patientPrep: "Być na czczo (8-12h). Unikać wysiłku fizycznego przed pobraniem.",
    stability: "4h w temp. pokojowej, 24h w temp. 2-8°C",
    referenceRange: [
      { gender: "Kobiety", range: "3.5-5.0 mln/µl (RBC)" },
      { gender: "Mężczyźni", range: "4.2-5.4 mln/µl (RBC)" },
    ]
  },
  {
    id: "2",
    name: "Glukoza na czczo",
    code: "LOINC: 1558-6",
    laboratory: "Szpital Wojewódzki - Lab. Centralne",
    specimen: "Osocze (Fluorek)",
    category: "Biochemia",
    status: "active",
    description: "Oznaczenie stężenia glukozy we krwi żylnej. Podstawowe badanie w diagnostyce i monitorowaniu cukrzycy oraz zaburzeń metabolizmu węglowodanów.",
    containerType: "Probówka z fluorkiem sodu",
    containerColor: "#94a3b8", // Grey
    patientPrep: "Bezwzględnie na czczo (min. 8h).",
    stability: "24h w temp. pokojowej (po oddzieleniu osocza)",
    referenceRange: [
      { gender: "Dorośli", range: "70-99 mg/dl" },
    ]
  },
  {
    id: "3",
    name: "TSH (Tyreotropina)",
    code: "LOINC: 11580-8",
    laboratory: "Diagnostyka Łódź - Centrum",
    specimen: "Surowica",
    category: "Immunochemia",
    status: "active",
    description: "Hormon tyreotropowy wydzielany przez przysadkę mózgową. Najczulszy wskaźnik czynności tarczycy (niedoczynności lub nadczynności).",
    containerType: "Probówka na skrzep (aktywator)",
    containerColor: "#ef4444", // Red
    patientPrep: "Na czczo, rano (zmienność dobowa). Leki tarczycowe przyjąć po pobraniu.",
    stability: "7 dni w temp. 2-8°C",
    referenceRange: [
      { gender: "Dorośli", range: "0.27 - 4.2 µIU/ml" },
    ]
  },
  {
    id: "4",
    name: "Lipidogram (CHOL, HDL, LDL, TG)",
    code: "LOINC: 24331-1",
    laboratory: "Szpital Wojewódzki - Lab. Centralne",
    specimen: "Surowica",
    category: "Biochemia",
    status: "active",
    description: "Profil lipidowy obejmujący cholesterol całkowity, frakcje HDL, LDL oraz trójglicerydy. Kluczowy w ocenie ryzyka sercowo-naczyniowego.",
    containerType: "Probówka na skrzep",
    containerColor: "#ef4444", // Red
    patientPrep: "Na czczo (10-12h). Dieta lekkostrawna dzień wcześniej.",
    stability: "3 dni w temp. 2-8°C",
    referenceRange: [
      { gender: "Cholesterol całk.", range: "< 190 mg/dl" },
      { gender: "LDL", range: "< 115 mg/dl (niskie ryzyko)" },
    ]
  },
  {
    id: "5",
    name: "CRP (Białko C-reaktywne, ilościowo)",
    code: "LOINC: 1988-5",
    laboratory: "Centrum Medyczne 'Zdrowie'",
    specimen: "Surowica",
    category: "Immunochemia",
    status: "unavailable",
    description: "Białko ostrej fazy. Marker stanu zapalnego, infekcji bakteryjnych oraz uszkodzenia tkanek.",
    containerType: "Probówka na skrzep",
    containerColor: "#ef4444", // Red
    patientPrep: "Na czczo nie jest bezwzględnie wymagane, ale zalecane.",
    stability: "3 dni w temp. 2-8°C",
    referenceRange: [
      { gender: "Dorośli", range: "< 5 mg/l" },
    ]
  },
  {
    id: "6",
    name: "Badanie ogólne moczu",
    code: "LOINC: 24356-8",
    laboratory: "Diagnostyka Łódź - Centrum",
    specimen: "Mocz",
    category: "Analityka Ogólna",
    status: "active",
    description: "Podstawowe badanie przesiewowe oceniające cechy fizykochemiczne moczu oraz osad. Pomocne w chorobach nerek, układu moczowego i chorobach metabolicznych.",
    containerType: "Pojemnik na mocz (niesterylny)",
    containerColor: "#eab308", // Yellowish mock
    patientPrep: "Mocz poranny, ze środkowego strumienia, po higienie krocza.",
    stability: "2h w temp. pokojowej",
    referenceRange: [
      { gender: "pH", range: "5.0 - 7.0" },
      { gender: "Ciężar wł.", range: "1.015 - 1.025" },
    ]
  },
  {
    id: "7",
    name: "Witamina D3 (25-OH)",
    code: "LOINC: 62292-8",
    laboratory: "Centrum Medyczne 'Zdrowie'",
    specimen: "Surowica",
    category: "Immunochemia",
    status: "active",
    description: "Metabolit 25-hydroksywitamina D. Odzwierciedla stan zaopatrzenia organizmu w witaminę D.",
    containerType: "Probówka na skrzep",
    containerColor: "#ef4444", // Red
    patientPrep: "Bez specjalnego przygotowania.",
    stability: "72h w temp. pokojowej",
    referenceRange: [
      { gender: "Optimum", range: "30 - 50 ng/ml" },
    ]
  },
];

const LABORATORIES = Array.from(new Set(MOCK_DATA.map(d => d.laboratory))).sort();
const SPECIMENS = Array.from(new Set(MOCK_DATA.map(d => d.specimen))).sort();

export default function App() {
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLab, setSelectedLab] = useState<string>("all");
  const [selectedSpecimen, setSelectedSpecimen] = useState<string>("all");

  // Selection & Basket
  const [basket, setBasket] = useState<Set<string>>(new Set());

  // Drawers & Modals
  const [detailsId, setDetailsId] = useState<string | null>(null); // For Knowledge Base Drawer
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Order Form State
  const [orderPriority, setOrderPriority] = useState("routine");
  const [patientName, setPatientName] = useState("");
  const [requesterName] = useState("Dr n. med. Jan Kowalski");

  // --- Derived State ---
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLab = selectedLab === "all" || item.laboratory === selectedLab;
      const matchesSpecimen = selectedSpecimen === "all" || item.specimen === selectedSpecimen;

      return matchesSearch && matchesLab && matchesSpecimen;
    });
  }, [searchTerm, selectedLab, selectedSpecimen]);

  const basketItems = useMemo(() => {
    return MOCK_DATA.filter(item => basket.has(item.id));
  }, [basket]);

  const basketGroups = useMemo(() => {
    const groups: Record<string, ServiceDefinition[]> = {};
    basketItems.forEach(item => {
      if (!groups[item.laboratory]) groups[item.laboratory] = [];
      groups[item.laboratory].push(item);
    });
    return groups;
  }, [basketItems]);

  const basketHasMultipleLabs = Object.keys(basketGroups).length > 1;

  // --- Handlers ---
  const toggleSelection = (id: string) => {
    const newBasket = new Set(basket);
    if (newBasket.has(id)) {
      newBasket.delete(id);
    } else {
      newBasket.add(id);
    }
    setBasket(newBasket);
  };

  const selectedService = detailsId ? MOCK_DATA.find(d => d.id === detailsId) : null;

  const generateServiceRequestJSON = () => {
    // Generate simple FHIR-like JSON
    const requests = Object.keys(basketGroups).map(labName => ({
      resourceType: "ServiceRequest",
      status: "draft",
      intent: "order",
      priority: orderPriority,
      requester: {
        display: requesterName
      },
      subject: {
        display: patientName || "Nieokreślony Pacjent"
      },
      performer: [
        {
          type: "Organization",
          display: labName
        }
      ],
      code: {
        coding: basketGroups[labName].map(item => ({
          system: "http://loinc.org",
          code: item.code.replace("LOINC: ", ""),
          display: item.name
        }))
      }
    }));
    return JSON.stringify(requests.length === 1 ? requests[0] : requests, null, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700">Dostępne</Badge>;
      case "unavailable":
        return <Badge variant="secondary" className="text-slate-500">Niedostępne</Badge>;
      default:
        return <Badge variant="outline">Nieznany</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-32">
      {/* --- Header --- */}
      <header className="sticky top-0 z-20 w-full border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Katalog Usług Diagnostycznych
              </h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-xs font-medium text-slate-500">
                  Baza Wiedzy: Połączono (FHIR R4)
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right text-sm leading-tight text-slate-500 md:block">
              <span className="block font-semibold text-slate-700">{requesterName}</span>
              <span className="text-xs">Oddział Chorób Wewnętrznych</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-700">
              <span className="text-sm font-semibold">JK</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="mx-auto max-w-7xl p-6">
        
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tworzenie Zlecenia</h2>
            <p className="mt-1 text-lg text-slate-600">
              Wybierz badania z katalogu, aby utworzyć nowe zlecenie laboratoryjne.
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border-slate-200 shadow-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium leading-none">Szukaj badania</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Nazwa badania, kod LOINC..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full space-y-2 md:w-[280px]">
                <label className="text-sm font-medium leading-none">Laboratorium</label>
                <Select value={selectedLab} onValueChange={setSelectedLab}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="h-4 w-4" />
                      <SelectValue placeholder="Wszystkie" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie laboratoria</SelectItem>
                    {LABORATORIES.map((lab) => (
                      <SelectItem key={lab} value={lab}>{lab}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full space-y-2 md:w-[240px]">
                <label className="text-sm font-medium leading-none">Materiał</label>
                <Select value={selectedSpecimen} onValueChange={setSelectedSpecimen}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2 text-slate-600">
                      <FlaskConical className="h-4 w-4" />
                      <SelectValue placeholder="Wszystkie" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie materiały</SelectItem>
                    {SPECIMENS.map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

               <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedLab("all");
                  setSelectedSpecimen("all");
                }}
                className="shrink-0"
              >
                <Filter className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="border-slate-200 shadow-sm">
          <div className="rounded-md">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                     {/* Checkbox Header could go here for Select All, simplifying for now */}
                  </TableHead>
                  <TableHead className="w-[300px]">Nazwa Badania & Kod</TableHead>
                  <TableHead>Kategoria</TableHead>
                  <TableHead>Laboratorium</TableHead>
                  <TableHead>Materiał</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right">Baza Wiedzy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => {
                  const isSelected = basket.has(item.id);
                  return (
                    <TableRow 
                      key={item.id} 
                      className={`group transition-colors ${isSelected ? "bg-blue-50/50 hover:bg-blue-50" : "hover:bg-slate-50/50"}`}
                    >
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(item.id)}
                          aria-label={`Select ${item.name}`}
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-1">
                          <span className={`font-semibold transition-colors ${isSelected ? "text-blue-700" : "text-slate-900"}`}>
                            {item.name}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                            <Activity className="h-3 w-3" />
                            {item.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="mt-1 inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {item.category}
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex items-start gap-2 mt-1">
                          <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-slate-700">{item.laboratory}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex items-center gap-2 mt-1">
                          <TestTube2 className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="text-sm text-slate-700">{item.specimen}</span>
                        </div>
                      </TableCell>
                      <TableCell className="align-top pt-4">
                        {getStatusBadge(item.status)}
                      </TableCell>
                      <TableCell className="text-right align-middle">
                        <Button variant="ghost" size="sm" onClick={() => setDetailsId(item.id)}>
                          <Info className="mr-2 h-4 w-4" />
                          Szczegóły
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* --- Fixed Basket / Order Summary Bar --- */}
      {basket.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-slate-900">
                  Koszyk Zleceń ({basket.size} {basket.size === 1 ? 'badanie' : 'badania'})
                </h3>
              </div>
              
              <div className="text-sm text-slate-500 line-clamp-1">
                 Wybrano: {basketItems.map(i => i.name).join(", ")}
              </div>
              
              {basketHasMultipleLabs && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 border border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  Uwaga: Wybrano badania z {Object.keys(basketGroups).length} różnych laboratoriów. System wygeneruje oddzielne zlecenia.
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button 
                variant="outline" 
                onClick={() => setBasket(new Set())}
                className="text-slate-600"
              >
                Wyczyść
              </Button>
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                onClick={() => setIsOrderModalOpen(true)}
              >
                Przejdź do Zlecenia
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- Knowledge Base Drawer (Sheet) --- */}
      <Sheet open={!!detailsId} onOpenChange={(open) => !open && setDetailsId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selectedService && (
            <>
              <SheetHeader className="mb-6 space-y-1">
                <Badge variant="outline" className="w-fit mb-2 text-blue-700 border-blue-200 bg-blue-50">
                  FHIR: ActivityDefinition
                </Badge>
                <SheetTitle className="text-2xl leading-tight">
                  {selectedService.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-2 text-base">
                  <span className="font-mono text-slate-900">{selectedService.code}</span>
                  <span>•</span>
                  <span>{selectedService.category}</span>
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-8">
                {/* Section A: Clinical Significance */}
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                    <Activity className="h-4 w-4" />
                    Znaczenie Kliniczne
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {selectedService.description}
                  </p>
                </section>

                {/* Section B: Pre-analytical Factors */}
                <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                    <FlaskConical className="h-4 w-4" />
                    Faza Przedanalityczna
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Container Type */}
                    <div className="flex items-start gap-3">
                      <div 
                        className="h-10 w-10 shrink-0 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: selectedService.containerColor }}
                        title={selectedService.containerType}
                      >
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500">Pojemnik</span>
                        <span className="text-sm font-medium text-slate-900">{selectedService.containerType}</span>
                      </div>
                    </div>

                    {/* Stability */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm border border-slate-100">
                         <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500">Stabilność</span>
                        <span className="text-sm font-medium text-slate-900">{selectedService.stability}</span>
                      </div>
                    </div>

                    {/* Patient Prep */}
                    <div className="col-span-full flex items-start gap-3 pt-2">
                       <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 shadow-sm border border-amber-100">
                         <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-500">Przygotowanie Pacjenta</span>
                        <span className="text-sm font-medium text-slate-900">{selectedService.patientPrep}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section C: Reference Ranges */}
                <section>
                   <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                    <Thermometer className="h-4 w-4" />
                    Zakresy Referencyjne
                  </h4>
                  <div className="rounded-md border border-slate-200">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow className="h-8 hover:bg-slate-50">
                          <TableHead className="h-8">Płeć / Grupa</TableHead>
                          <TableHead className="h-8 text-right">Zakres</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedService.referenceRange.map((range, idx) => (
                          <TableRow key={idx} className="h-9">
                            <TableCell className="py-2 font-medium">{range.gender}</TableCell>
                            <TableCell className="py-2 text-right">{range.range}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    * Wartości referencyjne mogą się różnić w zależności od metody analitycznej laboratorium.
                  </p>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* --- Order Configuration Modal --- */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Konfiguracja Zlecenia (ServiceRequest)</DialogTitle>
            <DialogDescription>
              Uzupełnij dane zlecenia przed wysłaniem do laboratorium.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
             {/* Simple Form */}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <Label>Zlecający (Requester)</Label>
                   <Input disabled value={requesterName} className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                   <Label>Pacjent (Subject)</Label>
                   <Input 
                      placeholder="Wyszukaj pacjenta (np. PESEL)" 
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                   />
                </div>
             </div>

             <div className="space-y-2">
               <Label>Priorytet (Priority)</Label>
               <RadioGroup 
                  value={orderPriority} 
                  onValueChange={setOrderPriority}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="routine" id="r1" />
                    <Label htmlFor="r1">Rutynowy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asap" id="r2" />
                    <Label htmlFor="r2">Pilny (ASAP)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stat" id="r3" />
                    <Label htmlFor="r3" className="text-red-600 font-semibold">CITO (STAT)</Label>
                  </div>
               </RadioGroup>
             </div>

             {/* JSON Preview */}
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Podgląd zasobu FHIR (JSON)</Label>
                  <Badge variant="outline" className="font-mono text-[10px]">FHIR R4 / JSON</Badge>
                </div>
                <div className="relative rounded-md border bg-slate-950 p-4 text-xs font-mono text-slate-50 shadow-inner">
                  <FileJson className="absolute right-4 top-4 h-4 w-4 text-slate-500" />
                  <ScrollArea className="h-[200px]">
                    <pre className="whitespace-pre-wrap">
                      {generateServiceRequestJSON()}
                    </pre>
                  </ScrollArea>
                </div>
             </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>Anuluj</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Mock submit
                setIsOrderModalOpen(false);
                setBasket(new Set());
              }}
            >
              Wyślij Zlecenie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
