import { useState, useEffect, type ReactNode } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Building2, Shield, ChevronRight, Lock, Loader2, ArrowLeft } from "lucide-react";
import * as api from "../utils/api";

const LOGO_SRC = "/assets/ChatGPT Image Feb 19, 2026, 10_08_07 PM.png";
let statesCache: api.State[] | null = null;
let statesRequest: Promise<api.State[]> | null = null;
const municipalsCache = new Map<string, api.Municipal[]>();
const municipalsRequests = new Map<string, Promise<api.Municipal[]>>();

interface LoginPageProps {
  onMunicipalLogin: (municipalId: string, municipalName: string, stateId: string, stateName: string) => void;
  onStateLogin: (stateId: string, stateName: string) => void;
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#c1819c_0%,#4a66b1_100%)] p-4">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function HeaderIcon({ type }: { type: "municipal" | "state" | "main" }) {
  if (type === "main") {
    return (
      <div className="mb-5 inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#062e63] shadow-[0_14px_28px_-8px_rgba(2,16,48,0.95)]">
        <img src={LOGO_SRC} alt="CivicChain logo" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className="mb-5 inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#062e63] shadow-[0_14px_28px_-8px_rgba(2,16,48,0.95)]">
      <img src={LOGO_SRC} alt="CivicChain logo" className="h-full w-full object-cover" />
    </div>
  );
}

export function LoginPage({ onMunicipalLogin, onStateLogin }: LoginPageProps) {
  const [loginType, setLoginType] = useState<"municipal" | "state" | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedMunicipal, setSelectedMunicipal] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<api.State[]>([]);
  const [municipals, setMunicipals] = useState<api.Municipal[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingMunicipals, setLoadingMunicipals] = useState(false);

  useEffect(() => {
    // Warm cache as soon as login page mounts for faster first interaction.
    void loadStates();
  }, []);

  useEffect(() => {
    if (loginType === "municipal" || loginType === "state") {
      void loadStates();
    }
  }, [loginType]);

  useEffect(() => {
    if (selectedState && loginType === "municipal") {
      loadMunicipals(selectedState);
    }
  }, [selectedState, loginType]);

  const loadStates = async () => {
    if (statesCache) {
      setStates(statesCache);
      return;
    }

    try {
      setLoadingStates(true);
      if (!statesRequest) {
        statesRequest = api.getStates();
      }
      const data = await statesRequest;
      statesCache = data;
      setStates(data);
    } catch (err) {
      console.error("Error loading states:", err);
      setError("Failed to load states. Please try again.");
    } finally {
      statesRequest = null;
      setLoadingStates(false);
    }
  };

  const loadMunicipals = async (stateId: string) => {
    const cachedMunicipals = municipalsCache.get(stateId);
    if (cachedMunicipals) {
      setMunicipals(cachedMunicipals);
      return;
    }

    try {
      setLoadingMunicipals(true);
      if (!municipalsRequests.has(stateId)) {
        municipalsRequests.set(stateId, api.getMunicipalsByState(stateId));
      }
      const data = await municipalsRequests.get(stateId)!;
      municipalsCache.set(stateId, data);
      setMunicipals(data);
    } catch (err) {
      console.error("Error loading municipals:", err);
      setError("Failed to load municipal corporations. Please try again.");
    } finally {
      municipalsRequests.delete(stateId);
      setLoadingMunicipals(false);
    }
  };

  const resetForm = () => {
    setSelectedState("");
    setSelectedMunicipal("");
    setPassword("");
    setError("");
    setMunicipals([]);
  };

  const handleBack = () => {
    setLoginType(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loginType === "state") {
      if (!selectedState || !password) {
        setError("Please fill in all fields");
        return;
      }

      const stateData = states.find((s) => s.id === selectedState);
      if (!stateData) {
        setError("Please select a valid state");
        return;
      }

      setLoading(true);
      setError("");
      const expectedPassword = `${selectedState}123`;
      if (password !== expectedPassword) {
        setError(`Invalid credentials. For demo use password ${expectedPassword}`);
        setPassword("");
        setLoading(false);
        return;
      }

      onStateLogin(stateData.id, stateData.name);
      setLoading(false);
      return;
    }

    if (!selectedState || !selectedMunicipal || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await api.loginMunicipal(selectedMunicipal, password);
      if (!result.success) {
        setError(result.message || "Invalid credentials. Please try again.");
        setPassword("");
        return;
      }

      const stateData = states.find((s) => s.id === selectedState);
      if (!stateData) {
        setError("Unable to identify selected state. Please try again.");
        return;
      }

      localStorage.setItem("selectedStateId", stateData.id);
      localStorage.setItem("selectedStateName", stateData.name);
      onMunicipalLogin(result.municipal.id, result.municipal.name, stateData.id, stateData.name);
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials and try again.");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  if (!loginType) {
    return (
      <PageShell>
        <Card className="w-full max-w-md rounded-[2.5rem] border-2 border-[#10213f] bg-white p-8 shadow-[0_22px_70px_-14px_rgba(0,0,0,0.95),0_42px_120px_-30px_rgba(0,0,0,0.9)]">
          <div className="text-center">
            <HeaderIcon type="main" />
            <h1 className="text-2xl text-slate-900">CivicChain Login</h1>
            <p className="mt-1 text-sm text-slate-600">Choose your dashboard type</p>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              onClick={() => {
                resetForm();
                setLoginType("municipal");
              }}
              onMouseEnter={() => {
                void loadStates();
              }}
              onFocus={() => {
                void loadStates();
              }}
              className="h-12 w-full !bg-[#0a3f86] !text-white hover:!bg-[#08366f]"
            >
              <Building2 className="mr-2 h-5 w-5" />
              Municipal Login
              <ChevronRight className="ml-auto h-5 w-5" />
            </Button>

            <Button
              onClick={() => {
                resetForm();
                setLoginType("state");
              }}
              onMouseEnter={() => {
                void loadStates();
              }}
              onFocus={() => {
                void loadStates();
              }}
              className="h-12 w-full !bg-[#364e9c] !text-white hover:!bg-[#2e4387]"
            >
              <Shield className="mr-2 h-5 w-5" />
              State Login
              <ChevronRight className="ml-auto h-5 w-5" />
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  const isState = loginType === "state";

  return (
    <PageShell>
      <Card className="w-full max-w-md rounded-[2.5rem] border-2 border-[#10213f] bg-white p-8 shadow-[0_22px_70px_-14px_rgba(0,0,0,0.95),0_42px_120px_-30px_rgba(0,0,0,0.9)]">
        <button
          onClick={handleBack}
          className="mb-3 inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="text-center">
          <HeaderIcon type={isState ? "state" : "municipal"} />
          <h1 className="text-2xl text-slate-900">{isState ? "State Login" : "Municipal Login"}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isState ? "Access state dashboard" : "Access municipal dashboard"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state" className="text-slate-700">State</Label>
            <Select
              value={selectedState}
              onValueChange={(value) => {
                setSelectedState(value);
                setSelectedMunicipal("");
                setMunicipals(municipalsCache.get(value) || []);
                setError("");
              }}
              disabled={loadingStates}
            >
              <SelectTrigger id="state" className="h-11 border-slate-300 bg-white text-slate-900">
                {loadingStates ? (
                  <span className="flex items-center gap-2 text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading states...
                  </span>
                ) : (
                  <SelectValue placeholder="Select state" />
                )}
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isState && (
            <div className="space-y-2">
              <Label htmlFor="municipal" className="text-slate-700">Municipal Corporation</Label>
              <Select
                value={selectedMunicipal}
                onValueChange={(value) => {
                  setSelectedMunicipal(value);
                  setError("");
                }}
                disabled={!selectedState || loadingMunicipals}
              >
                <SelectTrigger id="municipal" className="h-11 border-slate-300 bg-white text-slate-900">
                  {loadingMunicipals ? (
                    <span className="flex items-center gap-2 text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading municipals...
                    </span>
                  ) : (
                    <SelectValue placeholder="Select municipal corporation" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {municipals.map((municipal) => (
                    <SelectItem key={municipal.id} value={municipal.id}>
                      {municipal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="h-11 border-slate-300 bg-white pl-10 text-slate-900 placeholder:text-slate-400"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-slate-500">
              Demo password: {isState ? `${selectedState || "<state>"}123` : `${selectedMunicipal || "<municipal>"}123`}
            </p>
          </div>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Button
            type="submit"
            className="h-12 w-full !bg-[#0a3f86] !text-white hover:!bg-[#08366f]"
            disabled={loading || !selectedState || (!isState && !selectedMunicipal) || !password}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                Login
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
