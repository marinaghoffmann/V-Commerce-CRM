import { useNavigate } from "react-router-dom";
import { FeaturePill } from "../atoms/FeaturePill";
import { StatItem } from "../atoms/StatItem";
import logo from "../../assets/logo/logo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full font-sans">
      {/* Left Panel */}
      <div 
        className="w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-16 py-16 text-white relative"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, #244FAD 0%, #142A5C 100%)" }}
      >
        <div className="max-w-3xl mx-auto w-full space-y-12">
          {/* Stats Bar */}
          <div className="flex items-center justify-between text-center border-b border-white/20 pb-8 relative">
             <StatItem value="360°" label="Visão do Cliente" />
             
             {/* Divider */}
             <div className="w-[1px] h-16 bg-white opacity-50"></div>
             
             <StatItem value="1" label="Plataforma Unificada" />

             {/* Divider */}
             <div className="w-[1px] h-16 bg-white opacity-50"></div>

             <StatItem value="∞" label="Possibilidades" />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl lg:text-[42px] font-extrabold leading-tight">
              Cada cliente, <br/> uma história completa.
            </h1>
            <p className="text-base text-gray-200 leading-relaxed max-w-xl">
              Consolide dados, clientes e vendas em um único lugar.<br/>
              Tome decisões com clareza total.
            </p>
          </div>

          {/* Pills */}
          <div className="flex flex-wrap gap-3">
            <FeaturePill text="Dashboard completo" />
            <FeaturePill text="Agente de IA integrado" />
            <FeaturePill text="Rotina de pedidos simplificada" />
            <FeaturePill text="Atividade de clientes em tempo real" />
            <FeaturePill text="Catálogo de produtos além do básico" />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-[#FBFBFB] flex flex-col justify-center items-center px-8 lg:px-16 py-16 relative">
        <div className="max-w-2xl w-full space-y-12">
          {/* Logo / branding snippet */}
          <div className="flex flex-col items-center md:items-start justify-center space-y-1 text-center md:text-left">
            <img src={logo} alt="V-commerce Logo" className="mb-2 h-[130px] w-auto object-contain mx-auto md:mx-0" />
            <h2 className="text-3xl font-black text-[#1F2937]">V-commerce</h2>
            <p className="text-xs font-semibold text-gray-500 tracking-widest">CRM 360</p>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-5xl lg:text-6xl font-black text-[#21201D] leading-tight">
              Bem-vindo <br/> de volta
            </h2>
            <p className="text-gray-800 text-base leading-relaxed max-w-xl mx-auto md:mx-0">
              Acesse sua central de relacionamento e tenha uma visão completa 
              de cada cliente, desempenho do seus produtos e oportunidades.
            </p>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-8 flex items-center justify-center cursor-pointer space-x-3 bg-[#3377FF] hover:bg-blue-600 transition-colors text-white font-semibold text-xl py-4 px-10 rounded-[24px] w-full lg:w-auto"
          >
            <span>Entrar no sistema</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}