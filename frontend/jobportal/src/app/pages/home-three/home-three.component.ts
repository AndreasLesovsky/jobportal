import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  effect,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { DarkmodeService } from '../../services/darkmode.service';
import { ScrollbarComponent } from '../../parts/scrollbar/scrollbar.component';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

@Component({
  selector: 'app-home-three',
  imports: [TranslateModule, ScrollbarComponent, RouterModule],
  templateUrl: './home-three.component.html',
  styleUrl: './home-three.component.css'
})
export class HomeThreeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private model!: THREE.Object3D;
    private animationFrameId!: number;
    loading = true;
    private darkModeService = inject(DarkmodeService);
    private dirLight!: THREE.DirectionalLight;
    private ambiLight!: THREE.AmbientLight;
  
    constructor() {
      effect(() => {
        const mode = this.darkModeService.darkMode();
        this.updateSceneForMode(mode);
      });
    }
  
    ngAfterViewInit(): void {
      setTimeout(() => {
        this.loading = false;
      }, 3000);
  
      this.initScene();
      this.loadEnvironmentMapAndModel();
      this.animate();
      window.addEventListener('resize', this.onResize);
      this.onResize();
    }
  
    ngOnDestroy(): void {
      cancelAnimationFrame(this.animationFrameId);
      this.renderer.dispose(); // Wichtig!
      // Texturen, Geometrien etc. manuell freigeben
      if (this.model) {
        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            child.material?.dispose();
          }
        });
      }
      window.removeEventListener('resize', this.onResize);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }
  
    private initScene(): void {
      this.scene = new THREE.Scene();
      const { width, height } = this.getCanvasParentSize();
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvasRef.nativeElement,
        alpha: false,
        antialias: true,
      });
      this.renderer.setPixelRatio(this.getPixelRatio());
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  
      // Shadow Map aktivieren
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.VSMShadowMap;
  
      // Initiales Directional Light erstellen basierend auf aktuellem Modus
      const initialMode = this.darkModeService.darkMode();
      this.createLights(initialMode);
      this.updateMonitorMaterials(initialMode);
    }
  
    private getEnvironmentMapPath(mode: string): string {
      return mode = 'threejs-models/envs/qwantani_1k.hdr';
      // return mode === 'dark'
      //   ? 'threejs-models/envs/qwantani_night_1k.hdr'
      //   : 'threejs-models/envs/qwantani_1k.hdr';
    }
  
    private createLights(mode: string): void {
      // Altes Light entfernen falls vorhanden
      if (this.dirLight && this.ambiLight) {
        this.scene.remove(this.dirLight);
        this.scene.remove(this.ambiLight);
      }
  
      this.ambiLight = new THREE.AmbientLight();
      this.ambiLight.position.set(240, 20, -30);
  
      if (mode === 'dark') {
        this.ambiLight.color.set(0x667788);
        this.ambiLight.intensity = 5.5;
      } else {
        this.ambiLight.color.set(0xfff0e0);
        this.ambiLight.intensity = 0.25;
      }
  
      if (mode === 'dark') {
        this.dirLight = new THREE.DirectionalLight(0x8899cc, 7.5);
        this.dirLight.position.set(280, 150, -30);
        this.renderer.toneMappingExposure = 0.1;
      } else {
        this.dirLight = new THREE.DirectionalLight(0xffe0b0, 10);
        this.dirLight.position.set(287, 60, 45);
        this.renderer.toneMappingExposure = 0.275;
      }
  
      // Gemeinsame Shadow Camera Einstellungen
      this.dirLight.castShadow = true;
      this.dirLight.shadow.camera.left = -400;
      this.dirLight.shadow.camera.right = 600;
      this.dirLight.shadow.camera.top = 200;
      this.dirLight.shadow.camera.bottom = -150;
      this.dirLight.shadow.camera.near = 1;
      this.dirLight.shadow.camera.far = 1000;
      this.dirLight.shadow.mapSize.width = 2048;
      this.dirLight.shadow.mapSize.height = 2048;
      this.dirLight.shadow.bias = -0.0005;
  
      this.scene.add(this.dirLight);
      // this.scene.add(this.ambiLight);
  
      // const helper = new THREE.CameraHelper(this.dirLight.shadow.camera);
      // this.scene.add(helper);
    }
  
    private updateSceneForMode(mode: string): void {
      if (!this.scene || !this.renderer) return;
      this.createLights(mode);
      const envMapPath = this.getEnvironmentMapPath(mode);
      this.loadEnvironmentMap(envMapPath);
      this.updateMonitorMaterials(mode);
    }
  
    private updateMonitorMaterials(mode: string): void {
      if (!this.model) return;
  
      this.model.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.name.includes('Computers_Monitor')) {
          const mat = obj.material as THREE.MeshStandardMaterial;
          mat.emissive = new THREE.Color(0xffffff);
          if (mode === 'dark') {
            mat.emissiveIntensity = 4;
          } else {
            mat.emissiveIntensity = 1.5;
          }
          mat.needsUpdate = true;
        }
      });
    }
  
    private loadEnvironmentMap(path: string): void {
      const rgbeLoader = new RGBELoader();
      rgbeLoader.load(path, (texture) => {
        // Für Beleuchtung und Reflexionen
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = texture;
  
        // Env als sichtbaren Hintergrund hinzufügen
        texture.mapping = THREE.EquirectangularRefractionMapping;
        this.scene.background = texture;
  
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      });
    }
  
    private loadEnvironmentMapAndModel(): void {
      // Initial mit aktuellem Modus starten
      const mode = this.darkModeService.darkMode();
      const envMapPath = this.getEnvironmentMapPath(mode);
  
      this.loadEnvironmentMap(envMapPath);
      this.loadModel(mode);
    }
  
    private loadModel(mode: string): void {
      const loader = new GLTFLoader();
      loader.load('threejs-models/mersus_office_rework.glb', (glb) => {
        this.model = glb.scene;
        this.model.scale.set(17, 17, 17);
  
        // Durch alle Objekte gehen und Schatten aktivieren
        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
  
        // Emission Shader für die Monitore setzen
        this.updateMonitorMaterials(mode);
  
        const box = new THREE.Box3().setFromObject(this.model);
        const center = new THREE.Vector3();
        box.getCenter(center);
  
        // Modell verschieben
        this.model.position.sub(center);
        this.model.position.y += 30;
        this.model.position.x += 227.5;
  
        this.scene.add(this.model);
        this.setupScrollAnimation();
      });
    }
  
    private setupScrollAnimation(): void {
      const isMobile = this.isMobileDevice();
  
      // Kamera-Positionen 
      const steps = isMobile
        ? [ // Mobile
          new THREE.Vector3(265, 22, 23),
          new THREE.Vector3(255, 21, -5),
          new THREE.Vector3(228, 21, -5),
          new THREE.Vector3(186, 22, -96),
        ]
        : [ // Desktop
          new THREE.Vector3(265, 22, 23),
          new THREE.Vector3(246, 20, -12),
          new THREE.Vector3(222, 20, -16),
          new THREE.Vector3(186, 22, -96),
        ];
  
      // LookAt-Ziele 
      const lookTargets = isMobile
        ? [ // Mobile
          new THREE.Vector3(-1200, 0, -800),
          new THREE.Vector3(250, 5, -250),
          new THREE.Vector3(250, 5, -250),
          new THREE.Vector3(400, -30, -120),
        ]
        : [ // Desktop
          new THREE.Vector3(-1200, 0, -800),
          new THREE.Vector3(410, 10, -600),
          new THREE.Vector3(425, 5, -420),
          new THREE.Vector3(400, -30, -120),
        ];
  
      // FOV (Zoom) pro Step 
      const fovs = isMobile
        ? [68, 55, 55, 85]   // Mobile
        : [65, 38, 50, 64];  // Desktop
  
      // Catmull-Rom-Kurven 
      const positionCurve = new THREE.CatmullRomCurve3(steps, false, 'catmullrom', 0.1);
      const lookCurve = new THREE.CatmullRomCurve3(lookTargets, false, 'catmullrom', 0.2);
  
      // Für FOV Vektor3 nehmen, nur X nutzen
      const fovCurve = new THREE.CatmullRomCurve3(
        fovs.map(f => new THREE.Vector3(f, 0, 0)),
        false,
        'catmullrom',
        0.45
      );
  
      // Kamera initial setzen 
      this.camera.position.copy(positionCurve.getPoint(0));
      this.camera.lookAt(lookCurve.getPoint(0));
      this.camera.fov = fovCurve.getPoint(0).x;
      this.camera.updateProjectionMatrix();
  
      // GSAP ScrollTrigger Animation 
      gsap.to({ progress: 0 }, {
        progress: 1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: '.scroll-container',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
          onUpdate: (self) => {
            const t = self.progress;
  
            // Position, LookAt & FOV interpolieren
            const newPos = positionCurve.getPoint(t);
            const newLook = lookCurve.getPoint(t);
            const newFov = fovCurve.getPoint(t).x;
  
            this.camera.position.copy(newPos);
            this.camera.lookAt(newLook);
            this.camera.fov = newFov;
            this.camera.updateProjectionMatrix();
          },
        },
      });
    }
  
    private animate = (): void => {
      this.animationFrameId = requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
      // this.logCameraPosition(this.camera);
    };
  
    private onResize = (): void => {
      const { width, height } = this.getCanvasParentSize();
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
  
      this.renderer.setPixelRatio(this.getPixelRatio());
      this.renderer.setSize(width, height, false);
    };
  
    private getCanvasParentSize(): { width: number; height: number } {
      const canvas = this.canvasRef.nativeElement;
      const parent = canvas.closest('.canvas-wrapper') as HTMLElement;
      return {
        width: parent.clientWidth,
        height: parent.clientHeight,
      };
    }
  
    scrollTo(element: HTMLElement, duration = 1.75): void {
      const headerOffset = 5 * parseFloat(getComputedStyle(document.documentElement).fontSize); // 5rem
  
      gsap.to(window, {
        duration,
        scrollTo: { y: element, offsetY: headerOffset },
        ease: 'sine.inOut',
      });
    }
  
    private isMobileDevice(): boolean {
      return window.innerWidth < 992;
    }
  
    // PixelRatio setzen (Performane!)
    private getPixelRatio(): number {
      return this.isMobileDevice()
        ? Math.min(window.devicePixelRatio, 1.25) // Mobile
        : Math.min(window.devicePixelRatio, 2 );   // Desktop
    }
  
    // private logCameraPosition(camera: THREE.Camera) {
    //   console.log(
    //     `Camera position → x: ${camera.position.x.toFixed(2)}, y: ${camera.position.y.toFixed(2)}, z: ${camera.position.z.toFixed(2)}`
    //   );
    // }
}
