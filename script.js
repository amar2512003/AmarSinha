// --- Hero Graph Animation ---
// Visualizes a small DAG with a signal traveling across edges,
// like a topological traversal / pipeline execution.
const canvas = document.getElementById('graphCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    let edges = [];
    let pulses = [];

    const labels = ['DATA', 'PY', 'ML', 'CV', 'API', 'SQL', 'DAG', 'REACT', 'OCR', 'GIT'];

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        width = canvas.width = rect.width;
        height = canvas.height = rect.height;
        buildGraph();
    }

    function buildGraph() {
        nodes = [];
        edges = [];
        pulses = [];

        const cols = 4;
        const rows = 3;
        const marginX = width * 0.15;
        const marginY = height * 0.18;
        const usableW = width - marginX * 2;
        const usableH = height - marginY * 2;

        let id = 0;
        for (let r = 0; r < rows; r++) {
            const nodesInRow = r === 1 ? cols - 1 : cols;
            const offsetX = r === 1 ? (usableW / cols) / 2 : 0;
            for (let c = 0; c < nodesInRow; c++) {
                const jitterX = (Math.random() - 0.5) * 20;
                const jitterY = (Math.random() - 0.5) * 20;
                nodes.push({
                    id: id++,
                    x: marginX + offsetX + (usableW / cols) * c + (usableW / cols) / 2 + jitterX,
                    y: marginY + (usableH / (rows - 1)) * r + jitterY,
                    label: labels[id % labels.length],
                    row: r
                });
            }
        }

        // Connect nodes row -> next row (DAG-like, forward only)
        nodes.forEach(n => {
            if (n.row < rows - 1) {
                const nextRowNodes = nodes.filter(m => m.row === n.row + 1);
                const connections = nextRowNodes
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.random() > 0.5 ? 2 : 1);
                connections.forEach(target => {
                    edges.push({ from: n, to: target });
                });
            }
        });

        // Seed a few traveling pulses along random root->leaf paths
        for (let i = 0; i < 3; i++) {
            spawnPulse();
        }
    }

    function spawnPulse() {
        const roots = nodes.filter(n => n.row === 0);
        if (!roots.length) return;
        const start = roots[Math.floor(Math.random() * roots.length)];
        pulses.push({ node: start, t: 0, path: [start] });
    }

    function nextEdgeFrom(node) {
        const options = edges.filter(e => e.from.id === node.id);
        if (!options.length) return null;
        return options[Math.floor(Math.random() * options.length)];
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Edges
        edges.forEach(e => {
            ctx.beginPath();
            ctx.moveTo(e.from.x, e.from.y);
            ctx.lineTo(e.to.x, e.to.y);
            ctx.strokeStyle = 'rgba(76, 201, 240, 0.18)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Pulses traveling along edges
        pulses.forEach(p => {
            if (!p.edge) {
                p.edge = nextEdgeFrom(p.node);
                p.t = 0;
                if (!p.edge) {
                    p.done = true;
                    return;
                }
            }
            p.t += 0.012;
            const { from, to } = p.edge;
            const x = from.x + (to.x - from.x) * p.t;
            const y = from.y + (to.y - from.y) * p.t;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#F0A83C';
            ctx.shadowColor = 'rgba(240, 168, 60, 0.8)';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.t >= 1) {
                p.node = to;
                p.edge = null;
            }
        });

        pulses = pulses.filter(p => !p.done);
        while (pulses.length < 3) spawnPulse();

        // Nodes
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.arc(n.x, n.y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(76, 201, 240, 0.5)';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#7FDBFF';
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    draw();
}

// --- Smooth scrolling for navigation links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// --- Navbar scroll effect ---
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.35)';
        navbar.style.background = 'rgba(10, 14, 26, 0.98)';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.background = 'rgba(10, 14, 26, 0.9)';
    }
});

// --- Intersection Observer for fade-in animations ---
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

document.querySelectorAll('.skill-card, .project-card, .timeline-item').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Hero is visible on load, so reveal it immediately instead of waiting on scroll
const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroSection.style.opacity = '1';
    heroSection.style.transform = 'translateY(0)';
}

// --- CGPA bar chart reveal ---
const cgpaBars = document.querySelectorAll('.cgpa-bar');
if (cgpaBars.length) {
    const cgpaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.4 });

    cgpaBars.forEach(bar => cgpaObserver.observe(bar));
}

// --- Contact form handling ---
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        console.log('Form submitted:', formData);
        alert("Thanks for reaching out! I'll get back to you soon.");
        contactForm.reset();
    });
}

// --- Active nav link on scroll ---
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;

        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// --- Button hover micro-interaction ---
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-2px)';
    });

    btn.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
    });
});
