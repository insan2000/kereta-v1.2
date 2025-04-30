$(function() {
    // Inisialisasi peta TANPA tombol zoom default
    var map = new L.Map('map', {
      zoomControl: false
    }).setView([-7.352914, 111.590170], 9); //Center map and default zoom level

    // Tambahkan tombol zoom manual di kanan bawah
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Tambahkan feature geolokasi (NO REALTIME)
    /* function locateUser() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;

          // Tambahkan marker
          var marker = L.marker([lat, lng]).addTo(map)
            .bindPopup("📍 Posisi Anda Saat Ini:<br>Lat: " + lat.toFixed(5) + "<br>Lng: " + lng.toFixed(5))
            .openPopup();

          // Zoom ke posisi user
          map.setView([lat, lng], 14);
        }, function () {
          alert("Gagal mendapatkan lokasi.");
        });
      } else {
        alert("Geolocation tidak didukung browser Anda.");
      }
    }

    // Jalankan fungsi saat halaman dimuat (atau bisa pakai tombol jika diinginkan)
    locateUser();*/

    // Simpan marker user
    var userMarker;

    // Fungsi untuk melacak lokasi secara realtime
    function trackUser() {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function (position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          // Jika marker sudah ada, update posisinya
          if (userMarker) {
            userMarker.setLatLng([lat, lng])
              .setPopupContent("📍 Posisi Anda Saat Ini:<br>Lat: " + lat.toFixed(5) + "<br>Lng: " + lng.toFixed(5));
          } else {
            // Jika belum, buat marker baru
            userMarker = L.marker([lat, lng]).addTo(map)
              .bindPopup("📍 Posisi Anda Saat Ini:<br>Lat: " + lat.toFixed(5) + "<br>Lng: " + lng.toFixed(5))
              .openPopup();
          }
          // Geser peta ke posisi terbaru (NON AKTIF AGAR GAK GESER MAP)
          // map.setView([lat, lng], 14);
        }, function (err) {
          alert("Gagal mendapatkan lokasi: " + err.message);
        }, {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000
        });
      } else {
        alert("Browser Anda tidak mendukung geolocation.");
      }
    }

    // Mulai pelacakan saat halaman dimuat
    trackUser();

    // Definisi berbagai peta dasar
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});

    var outdoors = L.tileLayer('http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png');

    var OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});
    
    var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'});

    var Hybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: 'Map by <a href="https://maps.google.com/">Google</a>'});

    // Set peta dasar default
    osm.addTo(map);

    // Menyusun layer group untuk peta dasar
    var baseMaps = {
        "OpenStreetMap_Mapnik": osm,
        "Outdoors": outdoors,
        "OpenRailwayMap": OpenRailwayMap,
        "Citra Esri": esri,
        "Citra Google Hybrid": Hybrid
    };

    // Tambahkan kontrol layer untuk mengganti peta dasar (SUDAH DIBAWAH)
    // L.control.layers(baseMaps).addTo(map);

    // Cek Parsing JSON
    fetch('data/stasiun.js')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data.stasiun)) {
          data.stasiun.forEach(function(item) {
            console.log(item);
          });
        } else {
          console.log('stasiun is not an array');
        }
      })
      .catch(error => console.log('Error fetching data:', error));

    // Buat Custom Icon Stasiun
    var stationIcon = L.icon({
        iconUrl: 'images/stasiun.png', // Ganti dengan path ikon
        iconSize: [15, 18],  // Ukuran ikon [width, height]
        iconAnchor: [4, 13], // Titik pusat ikon
        popupAnchor: [3, -12] // Posisi popup relatif ke ikon
    });

    // 1. Layer untuk Stasiun
    var stationLayer = L.layerGroup();
    stasiun.forEach(function(marker) {
      L.marker([marker.lat, marker.lon], {icon: stationIcon})
        .addTo(stationLayer)
        .bindPopup("<center>" + marker.Stasiun + "<br>" + "Kode: " + marker.kode + "<br>" + "Wilayah Operasi: " + marker.wil_op +  "<br>" + "Koordinat: " + marker.lat + ", " + marker.lon + "</center>"); // Menambahkan label
    });

    // 2. Layer untuk Jalur Rel Kereta
    var railwayLayer1 = new L.GeoJSON.AJAX("data/json_1.json", {
      style: {color: "#ff0000", weight: 2, opacity: 0.65},
      onEachFeature: function (feature, layer) {
        layer.bindPopup("Jalur Rel Kereta Semarang - Surabaya");
      }
    });

    var railwayLayer2 = new L.GeoJSON.AJAX("data/json_2.json", {
      style: {color: "#0000FF", weight: 2, opacity: 0.65},
      onEachFeature: function (feature, layer) {
        layer.bindPopup("Jalur Rel Kereta Surabaya - Semarang");
      }
    });
    
    // 3. Layer Group untuk Semua Data
    var allDataLayer = L.layerGroup([stationLayer, railwayLayer1, railwayLayer2]);

    // 4. Layer Kontrol untuk Mengaktifkan/Nonaktifkan Data
    var overlayMaps = {
      "Stasiun": stationLayer,
      "Jalur Semarang - Surabaya": railwayLayer1,
      "Jalur Surabaya - Semarang": railwayLayer2
    };

    // 5. Tambahkan Layer Kontrol ke Peta
    L.control.layers(baseMaps, overlayMaps, {collapsed: true}).addTo(map);

    // 6. Tampilkan Semua Layer Secara Default
    allDataLayer.addTo(map);
    
    // Masih Zoom to Stasiun ?????????????????????????????????????????????????
    /* var zoomTo1 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer1 = zoomTo1.getContainer();
        $("#zoomke1").append(layerControlContainer1);

    var zoomTo2 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer2 = zoomTo2.getContainer();
        $("#zoomke2").append(layerControlContainer2);

    var zoomTo3 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer3 = zoomTo3.getContainer();
        $("#zoomke3").append(layerControlContainer3);

    var zoomTo4 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer4 = zoomTo4.getContainer();
        $("#zoomke4").append(layerControlContainer4);

    var zoomTo5 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer5 = zoomTo5.getContainer();
        $("#zoomke5").append(layerControlContainer5);

    var zoomTo6 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer6 = zoomTo6.getContainer();
        $("#zoomke6").append(layerControlContainer6);

    var zoomTo7 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer7 = zoomTo7.getContainer();
        $("#zoomke7").append(layerControlContainer7);

    var zoomTo8 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer8 = zoomTo8.getContainer();
        $("#zoomke8").append(layerControlContainer8);

    var zoomTo9 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer9 = zoomTo9.getContainer();
        $("#zoomke9").append(layerControlContainer9);

    var zoomTo10 = L.easyButton( 'fa-search-plus', function(){
            alert('Ubah waktu secara manual menggunakan time slider menjadi pukul 09.00 AM');
            map.setView([-6.97277222927478, 110.414575144596], 18);
          }).addTo(map);
          var layerControlContainer10 = zoomTo10.getContainer();
        $("#zoomke10").append(layerControlContainer10);*/

    // Colors for AwesomeMarkers
    var _colorIdx = 0,
        _colors = [
          'red',
          'red',
          'green',
          'green',
          'blue',
          'red',
          'blue',
          'darkpurple',
          'blue',
          'green',
          'darkpurple'
        ];
        
    function _assignColor() {
        return _colors[_colorIdx++%11];
    }
    
    
    // =====================================================
    // =============== Playback ============================
    // =====================================================

    // Playback options
    var playbackOptions = {        
        // layer and marker options
        layer: {
            pointToLayer : function(featureData, latlng){
                var result = {};
                
                if (featureData && featureData.properties && featureData.properties.path_options){
                    result = featureData.properties.path_options;
                }
                
                if (!result.radius){
                    result.radius = 5;
                }
                
                return new L.CircleMarker(latlng, result);
            }
        },
        
        marker: function(){
            return {
                icon: L.AwesomeMarkers.icon({
                    prefix: 'fa',
                    icon: 'train', 
                    markerColor: _assignColor()
                }),
                getPopup: function (feature) {
                return feature.properties.title;}  
            };
        },
        popups: true,
        fadeMarkersWhenStale: true,
        tracksLayer : false        
    };
    
    // Initialize playback
    var playback = new L.Playback(map, demoTracks, null, playbackOptions);
    
    // Initialize custom control
    var control = new L.Playback.Control(playback);
    control.addTo(map);
    
    // Add data
    playback.addData(ka269f, ka267, ka1, ka3, ka129, ka255, ka108, ka127, ka123, ka77, ka240f, ka268f,
ka268, ka2, ka4, ka130, ka256, ka106, ka128, ka125, ka78, ka238f);
       
});
