
const csvUrl = "https://raw.githubusercontent.com/rudyluis/PROGDAEM/refs/heads/main/Dashboard/DatosTecnologicos.csv";
let allData = [];

$(document).ready(function () {
// Realiza una petición AJAX para obtener el archivo CSV desde la URL definida en `csvUrl`
$.ajax({
    url: csvUrl,              // URL del archivo CSV (puede estar en GitHub u otro servidor)
    dataType: "text",         // Tipo de dato que esperamos recibir: texto plano (CSV)
    success: function (data) {  // Función que se ejecuta cuando la petición es exitosa
      const parsed = Papa.parse(data, { header: true }); 
      // Se parsea el CSV usando PapaParse, indicando que la primera fila son los encabezados
  
      allData = parsed.data.filter(d => d.pais); 
      // Se filtran los datos: solo se conservan filas que tengan el campo "pais" definido
  
      popularFiltros();       
      // Se llama a una función que actualiza las opciones de los combos/filtros
  
      aplicarFiltrosYGraficos(); 
      // Se aplica el filtrado actual y se actualizan los gráficos con los nuevos datos
    }
  });
  
  // Manejador de eventos para cuando cambian los valores de los filtros (selects)
  // Se incluyen filtros de País, Ciudad, Año y Categoría
  $('#filterPais, #filterCiudad, #filterAnio, #filterCategoria').on('change', function () {
    popularFiltros();         // Actualiza las opciones disponibles en los combos según los filtros seleccionados
    aplicarFiltrosYGraficos(); // Aplica los filtros seleccionados y actualiza los gráficos y tabla
  });
  
});

/*function popularFiltros() {
  const unique = (arr, key) => [...new Set(arr.map(d => d[key]).filter(Boolean))].sort();
  unique(allData, 'pais').forEach(v => $('#filterPais').append(`<option value="${v}">${v}</option>`));
  unique(allData, 'ciudad').forEach(v => $('#filterCiudad').append(`<option value="${v}">${v}</option>`));
  unique(allData, 'anio').forEach(v => $('#filterAnio').append(`<option value="${v}">${v}</option>`));
  unique(allData, 'categoría').forEach(v => $('#filterCategoria').append(`<option value="${v}">${v}</option>`));
}*/

function popularFiltros() {
    // Obtener el valor actualmente seleccionado en cada filtro
    const paisSel = $('#filterPais').val();
    const ciudadSel = $('#filterCiudad').val();
    const anioSel = $('#filterAnio').val();
    const catSel = $('#filterCategoria').val();
  
    // Filtrar los datos según las selecciones actuales (solo se incluyen coincidencias o todos si no hay selección)
    const filtrado = allData.filter(d =>
      (!paisSel || d.pais === paisSel) &&
      (!ciudadSel || d.ciudad === ciudadSel) &&
      (!anioSel || d.anio === anioSel) &&
      (!catSel || d.categoría === catSel)
    );
  
    // Función auxiliar para obtener valores únicos de una propiedad (columna), filtrando los vacíos y ordenando
    const unique = (arr, key) => [...new Set(arr.map(d => d[key]).filter(Boolean))].sort();
  
    // Función para actualizar el combo (select) con nuevas opciones
    const actualizarCombo = (id, valores) => {
      const select = $(id);             // Obtener el select por ID
      const valorActual = select.val(); // Guardar el valor actualmente seleccionado
      select.empty().append(`<option value="">Todos</option>`); // Reiniciar opciones con "Todos" como opción inicial
      valores.forEach(v => select.append(`<option value="${v}">${v}</option>`)); // Agregar nuevas opciones
      if (valores.includes(valorActual)) select.val(valorActual); // Restaurar selección si aún es válida
    };
  
    // Actualizar cada combo con los valores únicos correspondientes al conjunto de datos filtrado
    actualizarCombo('#filterPais', unique(filtrado, 'pais'));
    actualizarCombo('#filterCiudad', unique(filtrado, 'ciudad'));
    actualizarCombo('#filterAnio', unique(filtrado, 'anio'));
    actualizarCombo('#filterCategoria', unique(filtrado, 'categoría'));
  }
  
$('#filterPais, #filterCiudad, #filterAnio, #filterCategoria').on('change', function () {
  popularFiltros();        // actualizar opciones según selección
  aplicarFiltrosYGraficos(); // actualizar datos mostrados
});


function aplicarFiltrosYGraficos() {
    // Obtener los valores seleccionados en los combos de filtro
    const pais = $('#filterPais').val();
    const ciudad = $('#filterCiudad').val();
    const anio = $('#filterAnio').val();
    const categoria = $('#filterCategoria').val();
  
    // Filtrar los datos según los valores seleccionados
    // Si no hay valor seleccionado, se acepta cualquier valor en ese campo
    const filtrado = allData.filter(d =>
      (!pais || d.pais === pais) &&
      (!ciudad || d.ciudad === ciudad) &&
      (!anio || d.anio === anio) &&
      (!categoria || d.categoría === categoria)
    );
  
    // Llamar a la función que carga los datos en la tabla
    cargarTabla(filtrado);
  
    // Llamar a la función que genera los gráficos con los datos filtrados
    renderGraficos(filtrado);
  }
  

function cargarTabla(data) {
  // Obtener una instancia de la tabla existente
  const tabla = $('#tablaDatos').DataTable();

  // Limpiar y destruir la instancia anterior de DataTable
  tabla.clear().destroy();

  // Preparar los datos que se mostrarán en la tabla, extrayendo los campos necesarios en el orden correcto
  const cuerpo = data.map(d => [
    d.orden, d.anio, d.mes, d.dia, d.fecha,
    d.pais, d.ciudad, d.categoría, d.producto,
    d.precio, d.util_porcent, d.Cantidad, d.Total, d.utilidad
  ]);

  // Crear una nueva instancia de DataTable con los datos preparados
  $('#tablaDatos').DataTable({
    data: cuerpo, // datos ya transformados
    columns: [
      { title: "Orden" },
      { title: "Año" },
      { title: "Mes" },
      { title: "Día" },
      { title: "Fecha" },
      { title: "País" },
      { title: "Ciudad" },
      { title: "Categoría" },
      { title: "Producto" },
      {
        title: "Precio",              // Columna de precios
        className: "text-end",        // Alinear texto a la derecha
        render: function (data) {
          return parseFloat(data).toFixed(2); // Redondear a 2 decimales
        }
      },
      {
        title: "% Utilidad",          // Columna de porcentaje de utilidad
        className: "text-end",
        render: function (data) {
          return parseFloat(data).toFixed(2);
        }
      },
      {
        title: "Cantidad",            // Cantidad vendida
        className: "text-end",
        render: function (data) {
          return parseFloat(data).toFixed(2);
        }
      },
      {
        title: "Total",               // Total de venta
        className: "text-end",
        render: function (data) {
          return parseFloat(data).toFixed(2);
        }
      },
      {
        title: "Utilidad",            // Utilidad monetaria
        className: "text-end",
        render: function (data) {
          return parseFloat(data).toFixed(2);
        }
      }
    ],
    responsive: true // Hace que la tabla sea adaptable a distintos tamaños de pantalla
  });
}


function renderGraficos(data) {
    // 🧼 Eliminar todos los gráficos existentes antes de redibujar (evita superposición)
  ['ventasPorPais', 'ventasPorCategoria', 'ventasPorFecha', 'graficoRadar', 'graficoDoughnut'].forEach(id => {
    Chart.getChart(id)?.destroy();
  });
  // 🧮 Declarar objetos para acumular datos
  const ventasPais = {}, ventasCategoria = {}, ventasFecha = {}, radarData = {}, doughnutData = {};
  // 🔄 Recorrer los datos filtrados y sumar totales por diferentes dimensiones
  data.forEach(d => {
    const pais = d.pais;
    const cat = d.categoría;
    const fecha = d.fecha;
    const ciudad = d.ciudad;
    const total = parseFloat(d.Total || 0);

    ventasPais[pais] = (ventasPais[pais] || 0) + total;
    ventasCategoria[cat] = (ventasCategoria[cat] || 0) + total;
    ventasFecha[fecha] = (ventasFecha[fecha] || 0) + total;
    radarData[ciudad] = (radarData[ciudad] || 0) + total;
    doughnutData[cat] = (doughnutData[cat] || 0) + total;
  });
  // 📊 Gráfico de barras - Ventas por país
  new Chart(document.getElementById('ventasPorPais'), {
    type: 'bar',
    data: {
      labels: Object.keys(ventasPais),
      datasets: [{
        label: 'Total de Ventas por País',
        data: Object.values(ventasPais),
        backgroundColor: 'rgb(255, 153, 0)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
  // 🥧 Gráfico de pastel - Ventas por categoría
  new Chart(document.getElementById('ventasPorCategoria'), {
    type: 'pie',
    data: {
      labels: Object.keys(ventasCategoria),
      datasets: [{
        label: 'Ventas por Categoría',
        data: Object.values(ventasCategoria),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#C9CBCF', '#8E44AD', '#2ECC71', '#F39C12' // puedes agregar más colores si hay más categorías
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Distribución de Ventas por Categoría',
          font: {
            size: 18
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || '';
              let value = context.raw || 0;
              let total = context.dataset.data.reduce((a, b) => a + b, 0);
              let percentage = ((value / total) * 100).toFixed(2);
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 20,
            font: {
              size: 12
            }
          }
        }
      }
    }
  });

  // 📈 Gráfico de líneas - Ventas por fecha
  const fechasOrdenadas = Object.keys(ventasFecha).sort();
  new Chart(document.getElementById('ventasPorFecha'), {
    type: 'line',
    data: {
      labels: fechasOrdenadas,
      datasets: [{
        label: 'Ventas en el Tiempo',
        data: fechasOrdenadas.map(f => ventasFecha[f]),
        fill: false,
        borderColor: 'rgb(255, 102, 0)',
        tension: 0.1
      }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
      }
  });
  // 🕸️ Gráfico radar - Ventas por ciudad
  new Chart(document.getElementById('graficoRadar'), {
    type: 'radar',
    data: {
      labels: Object.keys(radarData),
      datasets: [{
        label: 'Ventas por Ciudad',
        data: Object.values(radarData),
        backgroundColor: 'rgb(255, 255, 153)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Ventas por Ciudad',
          font: {
            size: 18
          }
        }
      }
    }
  });
  // 🍩 Gráfico tipo doughnut - Otra vista por categoría
  new Chart(document.getElementById('graficoDoughnut'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(doughnutData),
      datasets: [{
        label: 'Distribución por Categoría',
        data: Object.values(doughnutData),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#C9CBCF', '#8E44AD', '#2ECC71', '#F39C12' // Colores adicionales por si hay más categorías
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%', // Grosor del centro del doughnut (más o menos hueco)
      plugins: {
        title: {
          display: true,
          text: 'Distribución por Categoría',
          font: {
            size: 18
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(2);
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 12
            }
          }
        }
      }
    }
  });


  $('#toggleTheme').on('click', function () {
    const html = document.documentElement;
    console.log(html);
    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    html.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
    
    this.textContent = isDark ? 'Modo Oscuro 🌙' : 'Modo Claro ☀️ ';

  });

}
