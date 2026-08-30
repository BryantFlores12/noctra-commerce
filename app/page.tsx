'use client';

import { FormEvent, PointerEvent, useEffect, useRef, useState } from 'react';
import { CheckoutPanel } from './components/CheckoutPanel';
import { LeadSignup } from './components/LeadSignup';

type Product = {
  id: number;
  name: string;
  type: string;
  price: number;
  image: string;
  badge?: string;
  material: string;
  description: string;
};

type CartItem = Product & { size: string; qty: number };
type ChatMessage = { from: 'ai' | 'user'; text: string; products?: Product[] };

const products: Product[] = [
  {
    id: 1,
    name: 'Vanta Dress 01',
    type: 'Vestido modular',
    price: 289,
    image: '/vanta-dress.png',
    badge: 'NUEVO',
    material: 'Crepé elástico · Mesh técnico',
    description: 'Una silueta asimétrica construida para cambiar con la luz y el movimiento.',
  },
  {
    id: 2,
    name: 'Signal Jacket 02',
    type: 'Bomber técnica',
    price: 340,
    image: '/signal-jacket.png',
    badge: 'BESTSELLER',
    material: 'Nylon mate · Aislante reciclado',
    description: 'Volumen preciso, peso mínimo y arquitectura adaptada al cuerpo.',
  },
  {
    id: 3,
    name: 'Vector Coat 03',
    type: 'Abrigo de autor',
    price: 475,
    image: '/vector-coat.png',
    badge: 'EDICIÓN 1/90',
    material: 'Lana reciclada · Forro satén',
    description: 'Un abrigo de líneas cinéticas con cuello de construcción escultórica.',
  },
  {
    id: 4,
    name: 'Orbit Trouser 04',
    type: 'Pantalón fluido',
    price: 198,
    image: '/signal-jacket.png',
    material: 'Gabardina técnica · Tencel',
    description: 'Pierna amplia, cintura regulable y una caída que responde al movimiento.',
  },
  {
    id: 5,
    name: 'Phase Top 05',
    type: 'Top asimétrico',
    price: 149,
    image: '/vanta-dress.png',
    material: 'Jersey compacto · Mesh',
    description: 'Una base escultural y suave pensada para construir capas sin volumen.',
  },
  {
    id: 6,
    name: 'Axis Knit 06',
    type: 'Punto estructural',
    price: 225,
    image: '/vector-coat.png',
    material: 'Merino trazable · Nylon reciclado',
    description: 'Tejido tridimensional que conserva su forma y regula la temperatura.',
  },
];

const socialEvents = [
  ['Lucía en Madrid', 'compró Signal Jacket 02', 'hace 2 min'],
  ['Mateo en Ciudad de México', 'añadió Vector Coat 03', 'hace 6 min'],
  ['Amelia en Barcelona', 'completó su look NOCTRA', 'hace 9 min'],
];

const money = (amount: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

export default function Home() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [fittingOpen, setFittingOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [size, setSize] = useState('M');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [socialIndex, setSocialIndex] = useState(0);
  const [socialVisible, setSocialVisible] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<string | null>(null);
  const [fitImage, setFitImage] = useState<string | null>(null);
  const [fitProduct, setFitProduct] = useState(products[1]);
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState(68);
  const [fit, setFit] = useState('regular');
  const [sizeResult, setSizeResult] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'ai', text: 'Hola. Soy NØA, tu estilista NOCTRA. Dime para qué ocasión quieres vestirte o pregúntame sobre talla, envío o devoluciones.' },
  ]);
  const heroImage = useRef<HTMLImageElement>(null);

  const subtotal = cart.reduce((total, item) => total + item.price * item.qty, 0);
  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const anyOverlay = selected || bagOpen || checkoutOpen || chatOpen || fittingOpen || sizeOpen || menuOpen;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const first = window.setTimeout(() => setSocialVisible(true), 2600);
    const timer = window.setInterval(() => {
      setSocialVisible(false);
      window.setTimeout(() => {
        setSocialIndex((index) => (index + 1) % socialEvents.length);
        setSocialVisible(true);
      }, 500);
    }, 8000);
    return () => { window.clearTimeout(first); window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = anyOverlay ? 'hidden' : '';
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAll();
    };
    window.addEventListener('keydown', escape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', escape);
    };
  }, [anyOverlay]);

  function closeAll() {
    setSelected(null);
    setBagOpen(false);
    setCheckoutOpen(false);
    setChatOpen(false);
    setFittingOpen(false);
    setSizeOpen(false);
    setMenuOpen(false);
  }

  function openProduct(product: Product) {
    setSelected(product);
    setSize('M');
    setRotation(0);
    setZoom(1);
  }

  function addToCart(product: Product, chosenSize = size) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === chosenSize);
      if (existing) return current.map((item) => item === existing ? { ...item, qty: item.qty + 1 } : item);
      return [...current, { ...product, size: chosenSize, qty: 1 }];
    });
    setSelected(null);
    setBagOpen(true);
  }

  function removeItem(index: number) {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function heroMove(event: PointerEvent<HTMLElement>) {
    if (!heroImage.current || window.innerWidth < 780) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * -12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    heroImage.current.style.transform = `scale(1.025) translate(${x}px, ${y}px)`;
  }

  async function askAssistant(question?: string) {
    const value = (question || chatInput).trim();
    if (!value || assistantBusy) return;
    const history = messages.slice(-8).map((message) => ({
      role: message.from === 'ai' ? 'assistant' : 'user',
      text: message.text,
    }));
    setMessages((current) => [...current, { from: 'user', text: value }]);
    setChatInput('');
    setAssistantBusy(true);

    try {
      const response = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: value, history }),
      });
      const data = await response.json() as { reply?: string; productIds?: number[]; error?: string };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'NØA no pudo responder.');
      }

      const recommendations = Array.isArray(data.productIds)
        ? data.productIds.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product))
        : [];

      setMessages((current) => [...current, {
        from: 'ai',
        text: data.reply as string,
        products: recommendations.length ? recommendations : undefined,
      }]);
    } catch (error) {
      setMessages((current) => [...current, {
        from: 'ai',
        text: error instanceof Error ? error.message : 'NØA no pudo responder. Inténtalo de nuevo.',
      }]);
    } finally {
      setAssistantBusy(false);
    }
  }

  function calculateSize(event: FormEvent) {
    event.preventDefault();
    const bmi = weight / Math.pow(height / 100, 2);
    let result = bmi < 20 ? 'S' : bmi < 25 ? 'M' : bmi < 29 ? 'L' : 'XL';
    if (fit === 'loose' && result !== 'XL') result = ({ S: 'M', M: 'L', L: 'XL' } as Record<string, string>)[result];
    if (fit === 'fitted' && result !== 'S') result = ({ XL: 'L', L: 'M', M: 'S' } as Record<string, string>)[result];
    setSizeResult(result);
  }

  function handleFitUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (fitImage) URL.revokeObjectURL(fitImage);
    setFitImage(URL.createObjectURL(file));
  }

  function completeOrder(orderId: string) {
    setCompletedOrder(orderId);
    window.setTimeout(() => {
      setCompletedOrder(null);
      setCheckoutOpen(false);
      setCart([]);
    }, 4200);
  }

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Navegación principal">
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><span /><span /></button>
        <a className="wordmark" href="#inicio" aria-label="NOCTRA, inicio">NOCTRA<span>°</span></a>
        <div className="nav-links">
          <a href="#coleccion">Colección</a><a href="#deseados">Más deseados</a><a href="#universo">Universo</a>
        </div>
        <div className="nav-actions">
          <button className="text-button" onClick={() => setFittingOpen(true)}>TRY-ON</button>
          <button className="bag-button" onClick={() => setBagOpen(true)} aria-label={`Abrir bolsa, ${cartCount} artículos`}>BOLSA <span>{cartCount}</span></button>
        </div>
      </nav>

      <section className="hero" id="inicio" onPointerMove={heroMove} onPointerLeave={() => heroImage.current?.removeAttribute('style')}>
        <img ref={heroImage} className="hero-image" src="/hero-noctra.png" alt="Modelo con chaqueta técnica negra en un estudio de luz violeta" />
        <div className="hero-vignette" /><div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> COLECCIÓN 01 — 2026</p>
          <h1>El futuro<br />te queda bien.</h1>
          <p className="hero-description">Prendas inteligentes. Siluetas precisas. Diseñadas para moverse entre mundos sin pedir permiso.</p>
          <div className="hero-ctas">
            <a className="primary-cta" href="#coleccion">EXPLORAR DROP <span>↗</span></a>
            <button className="ghost-cta" onClick={() => openProduct(products[1])}><span className="play">▶</span> EXPERIENCIA 360°</button>
          </div>
        </div>
        <div className="drop-card"><div><span className="pulse-dot" /> DROP ACTIVO</div><strong>17 piezas</strong><small>Edición numerada</small></div>
        <div className="hero-footer"><span>SCROLL TO DISCOVER</span><div className="scroll-line"><i /></div><span>40.4168° N · MADRID</span></div>
      </section>

      <section className="ticker" aria-label="Ventajas de NOCTRA">
        <div>ENVÍO EXPRESS 24/48H <i /> DEVOLUCIONES 30 DÍAS <i /> FIT AI <b>99% MATCH</b> <i /> PRODUCCIÓN LIMITADA <i /> ENVÍO EXPRESS 24/48H <i /> DEVOLUCIONES 30 DÍAS <i /> FIT AI <b>99% MATCH</b></div>
      </section>

      <section className="collection section" id="coleccion">
        <div className="section-heading reveal">
          <div><p className="section-index">01 / NUEVA COLECCIÓN</p><h2>Diseñado para<br /><em>después de ahora.</em></h2></div>
          <p className="section-note">DROP 01 explora la tensión entre estructura y movimiento. Cada pieza está numerada y producida en series cortas.</p>
        </div>
        <div className="product-grid">
          {products.slice(0, 3).map((product, index) => (
            <article className={`product-card reveal offset-${index}`} key={product.id}>
              <button className="product-image-wrap" onClick={() => openProduct(product)} aria-label={`Ver ${product.name}`}>
                {product.badge && <span className="product-badge">{product.badge}</span>}
                <img src={product.image} alt={product.name} />
                <span className="view-product">VISTA 360° <b>↗</b></span>
              </button>
              <div className="product-info"><div><h3>{product.name}</h3><p>{product.type}</p></div><strong>{money(product.price)}</strong></div>
            </article>
          ))}
        </div>
        <button className="outline-cta reveal" onClick={() => openProduct(products[0])}>VER COLECCIÓN COMPLETA <span>06 PIEZAS</span></button>
      </section>

      <section className="intelligence section" id="deseados">
        <div className="intelligence-copy reveal">
          <p className="section-index violet">02 / FIT INTELLIGENCE</p>
          <h2>Tu cuerpo.<br />Tu medida.<br /><em>Sin dudas.</em></h2>
          <p>Nuestro motor biométrico cruza tus proporciones, preferencia de ajuste y el patrón real de cada prenda para recomendar tu talla.</p>
          <div className="intelligence-actions"><button className="primary-cta" onClick={() => setSizeOpen(true)}>CALCULAR MI TALLA <span>↗</span></button><button className="link-cta" onClick={() => setFittingOpen(true)}>PROBAR VIRTUALMENTE →</button></div>
          <div className="metric-row"><div><strong>99%</strong><span>FIT MATCH*</span></div><div><strong>−38%</strong><span>DEVOLUCIONES</span></div><div><strong>48h</strong><span>ENVÍO EXPRESS</span></div></div>
          <small className="prototype-note">*Simulación de experiencia. La precisión final depende del modelo biométrico y datos de patronaje.</small>
        </div>
        <div className="intelligence-visual reveal">
          <div className="scan-frame"><img src="/vector-coat.png" alt="Modelo para análisis de talla" /><div className="scan-line" /><span className="scan-label one">HOMBRO <b>42.7 CM</b></span><span className="scan-label two">TORSO <b>88.4 CM</b></span><span className="scan-label three">FIT <b>REGULAR</b></span><div className="scan-status"><span /> BODY MAP READY</div></div>
        </div>
      </section>

      <section className="desired section">
        <div className="simple-heading reveal"><div><p className="section-index">03 / LOS MÁS DESEADOS</p><h2>Elegidos una y otra vez.</h2></div><span>DESLIZA →</span></div>
        <div className="horizontal-products">
          {products.slice(3).concat(products.slice(0, 2)).map((product) => (
            <article className="mini-product reveal" key={`mini-${product.id}`} onClick={() => openProduct(product)}>
              <div><img src={product.image} alt={product.name} /><button aria-label={`Añadir ${product.name}`} onClick={(event) => { event.stopPropagation(); addToCart(product); }}>+</button></div>
              <h3>{product.name}</h3><p>{money(product.price)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="manifesto" id="universo">
        <img src="/hero-noctra.png" alt="Campaña NOCTRA en estudio oscuro" />
        <div className="manifesto-overlay" />
        <div className="manifesto-copy reveal"><p className="section-index">04 / FILOSOFÍA</p><h2>No seguimos<br />el futuro.<br /><em>Lo vestimos.</em></h2><p>Diseñamos menos. Diseñamos mejor. Piezas de larga vida, materiales trazables y tecnología que sirve al cuerpo, no al ruido.</p><a href="#faq">CONOCE NUESTRO ESTÁNDAR ↗</a></div>
        <div className="manifesto-stat"><strong>01</strong><span>DROP / TEMPORADA</span></div>
      </section>

      <section className="social section">
        <div className="simple-heading reveal"><div><p className="section-index">05 / NOCTRA ON BODY</p><h2>Velo. Tócalo. <em>Hazlo tuyo.</em></h2></div><span>#NOCTRAONBODY</span></div>
        <div className="reels">
          {products.slice(0, 3).map((product, index) => (
            <article className={`reel-card reveal offset-${index}`} key={`reel-${product.id}`}>
              <img src={product.image} alt={`Look de ${product.name}`} />
              <div className="reel-shade" /><div className="reel-top"><span className="live-dot" /> LOOK {String(index + 1).padStart(2, '0')} <b>0:{18 + index * 7}</b></div>
              <button className="reel-play" aria-label="Reproducir look">▶</button>
              <button className="shop-look" onClick={() => addToCart(product)}><span><b>{product.name}</b><small>Comprar el look</small></span><strong>+</strong></button>
              <div className="reel-progress"><span style={{ width: `${36 + index * 19}%` }} /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="proof section">
        <p className="section-index reveal">06 / EN SUS PALABRAS</p>
        <div className="quote-grid reveal">
          <blockquote><span>“</span><p>La chaqueta no se siente como una prenda más. Se siente diseñada alrededor de mí.</p><footer><img src="/signal-jacket.png" alt="Avatar de Adrián" /><div><b>ADRIÁN M.</b><small>Madrid · Compra verificada</small></div><strong>★★★★★</strong></footer></blockquote>
          <blockquote><span>“</span><p>El recomendador acertó la talla a la primera. El empaque y la experiencia son impecables.</p><footer><img src="/vanta-dress.png" alt="Avatar de Clara" /><div><b>CLARA S.</b><small>Barcelona · Compra verificada</small></div><strong>★★★★★</strong></footer></blockquote>
        </div>
      </section>

      <section className="faq section" id="faq">
        <div className="faq-title reveal"><p className="section-index">07 / FAQ</p><h2>Preguntas,<br /><em>resueltas.</em></h2><button onClick={() => setChatOpen(true)}>PREGUNTAR A NØA ↗</button></div>
        <div className="faq-list reveal">
          <details open><summary>¿Cómo funcionan los envíos? <span>+</span></summary><p>Express 24–48 h en España y 2–5 días laborables en Europa. Recibirás seguimiento en tiempo real.</p></details>
          <details><summary>¿Puedo devolver una prenda? <span>+</span></summary><p>Sí. Dispones de 30 días con recogida sin coste, siempre que conserve etiquetas y estado original.</p></details>
          <details><summary>¿Cómo elijo mi talla? <span>+</span></summary><p>Fit Intelligence combina altura, peso, preferencia de ajuste y patronaje de cada prenda.</p></details>
          <details><summary>¿Qué métodos de pago aceptáis? <span>+</span></summary><p>Stripe procesa tarjetas y, en dispositivos compatibles, Apple Pay o Google Pay. El prototipo funciona ahora en modo de prueba.</p></details>
        </div>
      </section>

      <section className="newsletter"><div className="reveal"><p>ENTRA EN EL CÍRCULO</p><h2>Acceso antes<br />que nadie.</h2><LeadSignup /><small>Sin ruido. Solo drops, acceso anticipado y piezas privadas.</small></div></section>

      <footer className="footer"><a className="wordmark" href="#inicio">NOCTRA<span>°</span></a><p>© 2026 NOCTRA STUDIO</p><div><a href="#faq">PRIVACIDAD</a><a href="#faq">TÉRMINOS</a><a href="#faq">INSTAGRAM</a><a href="#faq">TIKTOK</a></div></footer>

      <button className={`social-toast ${socialVisible ? 'show' : ''}`} onClick={() => openProduct(products[(socialIndex + 1) % 3])} aria-label="Ver compra reciente"><img src={products[(socialIndex + 1) % 3].image} alt="" /><span><b>{socialEvents[socialIndex][0]}</b>{socialEvents[socialIndex][1]}<small>{socialEvents[socialIndex][2]} · COMPRA VERIFICADA</small></span><i /></button>
      <button className={`ai-orb ${chatOpen ? 'active' : ''}`} onClick={() => setChatOpen(!chatOpen)} aria-label="Abrir asistente NØA"><span className="orb-core">NØA</span><i /> <b>AI STYLIST</b></button>

      {menuOpen && <div className="menu-overlay overlay"><button className="close" onClick={() => setMenuOpen(false)}>×</button><a className="wordmark" href="#inicio">NOCTRA<span>°</span></a><nav><a href="#coleccion" onClick={() => setMenuOpen(false)}>Colección <span>01</span></a><a href="#deseados" onClick={() => setMenuOpen(false)}>Más deseados <span>02</span></a><a href="#universo" onClick={() => setMenuOpen(false)}>Universo <span>03</span></a><button onClick={() => { setMenuOpen(false); setFittingOpen(true); }}>Probador virtual <span>04</span></button></nav><p>MADRID · MÉXICO · WORLDWIDE</p></div>}

      {selected && <div className="product-modal overlay" role="dialog" aria-modal="true" aria-label={selected.name}>
        <button className="close" onClick={() => setSelected(null)}>×</button>
        <div className="viewer-panel">
          <div className="viewer-meta"><span>VISTA VIRTUAL 360°</span><b>ARRASTRA PARA ROTAR</b></div>
          <div className="orbit-ring" />
          <img src={selected.image} alt={selected.name} style={{ transform: `perspective(1000px) rotateY(${rotation}deg) scale(${zoom})` }} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragStart(event.clientX); }} onPointerMove={(event) => { if (dragStart !== null) { setRotation((current) => current + (event.clientX - dragStart) * .35); setDragStart(event.clientX); } }} onPointerUp={() => setDragStart(null)} />
          <div className="viewer-controls"><button onClick={() => setRotation((value) => value - 30)}>↺</button><span>{Math.round(((rotation % 360) + 360) % 360)}°</span><button onClick={() => setRotation((value) => value + 30)}>↻</button><label>ZOOM <input type="range" min="1" max="1.45" step=".05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label></div>
        </div>
        <div className="product-panel"><p className="section-index">DROP 01 / {selected.type}</p><h2>{selected.name}</h2><strong className="modal-price">{money(selected.price)}</strong><p className="modal-description">{selected.description}</p><div className="fabric"><span>MATERIAL</span><b>{selected.material}</b></div><div className="size-row"><div><span>SELECCIONA TALLA</span><button onClick={() => setSizeOpen(true)}>FIT AI ↗</button></div><div>{['XS','S','M','L','XL'].map((item) => <button className={size === item ? 'selected' : ''} key={item} onClick={() => setSize(item)}>{item}</button>)}</div></div><button className="add-button" onClick={() => addToCart(selected)}>AÑADIR A LA BOLSA <span>{money(selected.price)} ↗</span></button><button className="try-button" onClick={() => { setFitProduct(selected); setSelected(null); setFittingOpen(true); }}>PROBAR SOBRE MI FOTO · AR PREVIEW</button><div className="delivery"><span>◇ ENVÍO EXPRESS GRATIS</span><span>↺ DEVOLUCIÓN 30 DÍAS</span></div></div>
      </div>}

      {bagOpen && <><button className="drawer-backdrop" aria-label="Cerrar bolsa" onClick={() => setBagOpen(false)} /><aside className="cart-drawer drawer" role="dialog" aria-modal="true" aria-label="Tu bolsa"><header><div><p>YOUR BAG</p><h2>{cartCount} {cartCount === 1 ? 'PIEZA' : 'PIEZAS'}</h2></div><button className="close" onClick={() => setBagOpen(false)}>×</button></header>{cart.length === 0 ? <div className="empty-cart"><span>◇</span><h3>Tu bolsa espera.</h3><p>Descubre piezas diseñadas para quedarse.</p><button className="primary-cta" onClick={() => setBagOpen(false)}>EXPLORAR DROP ↗</button></div> : <><div className="cart-items">{cart.map((item, index) => <article key={`${item.id}-${item.size}-${index}`}><img src={item.image} alt={item.name} /><div><h3>{item.name}</h3><p>TALLA {item.size} · CANT. {item.qty}</p><strong>{money(item.price * item.qty)}</strong><button onClick={() => removeItem(index)}>ELIMINAR</button></div></article>)}</div><div className="cart-footer"><div><span>SUBTOTAL</span><strong>{money(subtotal)}</strong></div><p>Envío express y devoluciones incluidos.</p><button className="checkout-button" onClick={() => { setBagOpen(false); setCheckoutOpen(true); }}>CHECKOUT CON STRIPE <span>→</span></button><div className="paymarks"><b>●● VISA</b><b>Pay</b><b>G Pay</b><b>STRIPE TEST</b></div></div></>}</aside></>}

      {checkoutOpen && (completedOrder ? <div className="checkout overlay" role="dialog" aria-modal="true" aria-label="Pedido confirmado"><div className="order-complete"><span>✓</span><p>PAGO DE PRUEBA AUTORIZADO</p><h2>Tu pieza ya es parte de tu historia.</h2><small>Confirmación {completedOrder.slice(0, 18).toUpperCase()}</small></div></div> : <CheckoutPanel cart={cart} subtotal={subtotal} onClose={() => setCheckoutOpen(false)} onSuccess={completeOrder} />)}

      {chatOpen && <aside className="chat-panel drawer" role="dialog" aria-label="NØA, asistente de estilo"><header><div><span className="mini-orb">NØA</span><div><h3>NØA · AI STYLIST</h3><p><i /> ONLINE · GEMINI LIVE</p></div></div><button className="close" onClick={() => setChatOpen(false)}>×</button></header><div className="chat-messages" aria-live="polite">{messages.map((message, index) => <div className={`message ${message.from}`} key={index}><p>{message.text}</p>{message.products && <div className="chat-products">{message.products.map((product) => <button key={product.id} onClick={() => { setChatOpen(false); openProduct(product); }}><img src={product.image} alt="" /><span><b>{product.name}</b><small>{money(product.price)}</small></span></button>)}</div>}</div>)}{assistantBusy && <div className="message ai thinking"><p><span /><span /><span /></p></div>}</div><div className="quick-prompts"><button disabled={assistantBusy} onClick={() => askAssistant('Tengo una boda de noche en invierno y quiero algo moderno')}>LOOK PARA UNA BODA</button><button disabled={assistantBusy} onClick={() => askAssistant('¿Qué talla necesito?')}>AYUDA CON MI TALLA</button></div><form className="chat-input" onSubmit={(event) => { event.preventDefault(); askAssistant(); }}><input disabled={assistantBusy} value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder={assistantBusy ? 'NØA está pensando…' : 'Escribe lo que necesitas…'} aria-label="Mensaje para NØA" /><button disabled={assistantBusy} aria-label="Enviar">{assistantBusy ? '···' : '↑'}</button></form><small className="ai-disclaimer">GEMINI 3.6 FLASH · CATÁLOGO CONECTADO</small></aside>}

      {sizeOpen && <div className="size-modal modal-card overlay" role="dialog" aria-modal="true" aria-label="Calculadora biométrica"><button className="close" onClick={() => setSizeOpen(false)}>×</button><div className="modal-tag"><span /> NOCTRA FIT INTELLIGENCE</div><h2>Encuentra tu<br /><em>fit exacto.</em></h2><p>Introduce tres datos. El motor los compara con el patrón real de cada prenda.</p><form onSubmit={calculateSize}><label>ALTURA <strong>{height} cm</strong><input type="range" min="145" max="205" value={height} onChange={(event) => setHeight(Number(event.target.value))} /></label><label>PESO <strong>{weight} kg</strong><input type="range" min="40" max="130" value={weight} onChange={(event) => setWeight(Number(event.target.value))} /></label><fieldset><legend>¿CÓMO TE GUSTA LLEVAR LA ROPA?</legend>{[['fitted','AJUSTADA'],['regular','REGULAR'],['loose','SUELTA']].map(([value,label]) => <button type="button" className={fit === value ? 'selected' : ''} key={value} onClick={() => setFit(value)}>{label}</button>)}</fieldset><button className="add-button">CALCULAR MI TALLA ↗</button></form>{sizeResult && <div className="size-result"><span>TU TALLA RECOMENDADA</span><strong>{sizeResult}</strong><p>96% de confianza para tu preferencia de ajuste.</p><button onClick={() => { setSize(sizeResult); setSizeOpen(false); }}>USAR ESTA TALLA</button></div>}<small>Estimación de prototipo; valida las medidas del producto antes de comprar.</small></div>}

      {fittingOpen && <div className="fitting overlay" role="dialog" aria-modal="true" aria-label="Probador virtual"><button className="close" onClick={() => setFittingOpen(false)}>×</button><div className="fitting-copy"><p className="section-index violet">AR FITTING ROOM / BETA</p><h2>Prueba el look.<br /><em>Antes de tenerlo.</em></h2><p>Sube una foto de cuerpo entero. El prototipo la procesa solo en tu dispositivo y simula la superposición de la prenda.</p><div className="fit-product-list">{products.slice(0,3).map((product) => <button className={fitProduct.id === product.id ? 'selected' : ''} key={product.id} onClick={() => setFitProduct(product)}><img src={product.image} alt="" /><span>{product.name}</span></button>)}</div><label className="upload-button">{fitImage ? 'CAMBIAR FOTO' : 'SUBIR FOTO DE CUERPO ENTERO'} ↗<input type="file" accept="image/*" onChange={handleFitUpload} /></label><small>◇ PRIVACIDAD LOCAL · TU FOTO NO SE ALMACENA</small></div><div className={`fit-canvas ${fitImage ? 'has-image' : ''}`}>{fitImage ? <><img className="user-photo" src={fitImage} alt="Foto subida para probador" /><img className="garment-overlay" src={fitProduct.image} alt={`Superposición de ${fitProduct.name}`} /><span className="fit-badge">AI PREVIEW · {fitProduct.name}</span></> : <><div className="body-outline"><span /><i /></div><p>COLOCA TU CUERPO<br />DENTRO DEL MARCO</p><div className="fit-grid" /></>}</div></div>}
    </main>
  );
}
