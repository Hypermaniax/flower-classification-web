'use client';

import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Progress } from "@nextui-org/progress";
import { Image } from "@nextui-org/image";
import { Chip } from "@nextui-org/chip";
import { subtitle, title } from "@/components/primitives";
import { useState, useRef } from "react";
import { InfoIcon, Flower, Flower2, Droplet } from "lucide-react";

interface PredictionResponse {
  class: string;
  confidence: number;
}

const classes: Record<string, { description: string; care: string }> = {
  "rose": {
    "description": "Rosa atau yang sering dikenal dengan Rose(Bunga Mawar), merupakan bunga yang berasal dari berbagai belahan dunia, termasuk Asia, Eropa, Amerika Utara, dan Timur Tengah. Bunga ini dapat tumbuh di iklim sedang hingga tropis dan sering ditemukan di kebun serta taman hias. Mawar juga dikenal sebagai simbol cinta dan keindahan.",
    "care": "Mawar membutuhkan sinar matahari penuh minimal 6 jam sehari, penyiraman di pangkal tanaman secara teratur, tanah lempung yang kaya bahan organik, dan pemangkasan rutin untuk membuang bagian yang mati atau sakit."
  },
  "sunflower": {
    "description": "Helianthus annuus atau yang sering dikenal dengan nama Sunflower(Bunga Matahari), merupakan bunga yang berasal dari Amerika Utara dan Amerika Selatan. Bunga ini dapat tumbuh di daerah yang memiliki banyak sinar matahari, seperti ladang terbuka dan tanah yang subur. Sunflower sering digunakan untuk produksi minyak dan biji-bijian.",
    "care": "Bunga matahari membutuhkan sinar matahari penuh, penyiraman teratur saat pertumbuhan awal, tanah yang memiliki drainase baik, dan dukungan untuk varietas tinggi agar tidak roboh."
  },
  "tulip": {
    "description": "Tulipa gesneriana atau yang sering dikenal dengan Tulip, merupakan bunga yang berasal dari Asia Tengah dan telah dibudidayakan secara luas di Eropa, terutama di Belanda. Tulip tumbuh di iklim sedang dan sering ditanam di kebun serta taman musim semi. Tulip melambangkan kesempurnaan dan keanggunan.",
    "care": "Tulip membutuhkan sinar matahari penuh hingga teduh parsial, penyiraman moderat selama pertumbuhan, tanah berpasir dengan drainase baik, dan membiarkan daunnya mati secara alami setelah berbunga."
  },
  "daisy": {
    "description": "Bellis perennis atau yang sering dikenal dengan Daisy, merupakan bunga yang berasal dari Eropa dan Asia, tetapi sekarang dapat ditemukan hampir di seluruh dunia. Bunga ini tumbuh subur di padang rumput, ladang, dan taman dengan cahaya matahari yang cukup. Daisy melambangkan kepolosan dan kemurnian.",
    "care": "Daisy membutuhkan sinar matahari penuh, tanah dengan drainase baik, penyiraman teratur tanpa terlalu basah, dan deadheading untuk merangsang pertumbuhan bunga baru."
  },
  "dandelion": {
    "description": "Taraxacum officinale atau yang sering dikenal dengan Dandelion, merupakan bunga yang berasal dari Eurasia dan telah menyebar ke seluruh dunia. Bunga ini sering ditemukan di padang rumput, halaman, dan tempat-tempat dengan tanah yang terganggu, serta mampu tumbuh di berbagai iklim. Dandelion sering digunakan dalam pengobatan tradisional dan dianggap sebagai simbol ketahanan.",
    "care": "Dandelion membutuhkan sinar matahari penuh hingga teduh parsial, sedikit penyiraman, toleransi terhadap berbagai jenis tanah, dan perawatan minimal."
  },
}

export default function FlowerClassifier() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setPrediction(null);

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PredictionResponse = await response.json();
      setPrediction(data);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  return (
    <main className="container mx-auto px-4 max-w-4xl">
      <Card className="mb-8">
        <CardHeader className="flex-col items-start px-6 py-4">
          <div className="inline-block max-w-xl text-center justify-center">
            <span className={title()}>Flower&nbsp;</span>
            <span className={title({ color: "violet" })}>Classifier&nbsp;</span>
            <div className={subtitle({ class: "mt-4" })}>
              Upload an image to identify the type of flower.
            </div>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex justify-center items-center gap-2 bg-default-100 p-4 rounded-lg">
            <InfoIcon className="w-5 h-5 text-default-600" />
            <p className="text-sm text-default-600">
              Model can classify: daisy, dandelion, rose, sunflower, and tulip.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="imageUpload"
            />
            <Button
              onClick={triggerFileInput}
              color="primary"
              className="w-full md:w-auto cursor-pointer"
            >
              Select Image
            </Button>
          </div>

          {preview && (
            <div className="mt-4">
              <Image
                src={preview}
                alt="Preview"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          {error && (
            <p className="text-danger mt-2">{error}</p>
          )}

          <Button
            color="success"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!selectedFile || loading}
            className="w-full md:w-auto"
          >
            {loading ? 'Processing...' : 'Classify Flower'}
          </Button>

          {loading && (
            <Progress
              size="sm"
              isIndeterminate
              aria-label="Loading..."
              className="max-w-md"
            />
          )}

          {prediction && (
            <PredictionResults
              prediction={prediction}
              classes={classes}
            />
          )}
        </CardBody>
      </Card>
    </main>
  );
}

interface PredictionResultsProps {
  prediction: {
    class: string;
    confidence: number;
  };
  classes: Record<string, { description: string; care: string }>;
}

const PredictionResults = ({ prediction, classes }: PredictionResultsProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  const flowerClass = prediction.class as keyof typeof classes;
  const confidenceColor = getConfidenceColor(prediction.confidence);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50">
        <CardBody className="flex flex-row items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Flower className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-default-600">Identified Flower</p>
              <h3 className="text-2xl font-bold text-primary-600">
                {prediction.class.charAt(0).toUpperCase() + prediction.class.slice(1)}
              </h3>
            </div>
          </div>
          <Chip
            size="lg"
            color={confidenceColor}
            variant="flat"
            className="px-4"
          >
            {(prediction.confidence * 100).toFixed(1)}% Confidence
          </Chip>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-default-600">Confidence Level</span>
              <span className="text-sm font-medium text-default-600">
                {(prediction.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <Progress
              value={prediction.confidence * 100}
              color={confidenceColor}
              className="h-3"
              aria-label="Classification Confidence"
            />
          </div>
        </CardBody>
      </Card>

      <Card className="bg-default-50">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flower2 className="w-5 h-5 text-primary-500" />
            <h4 className="text-lg font-semibold">About This Flower</h4>
          </div>
          <p className="text-default-700 leading-relaxed">
            {classes[flowerClass].description}
          </p>
        </CardBody>
      </Card>

      <Card className="bg-default-50">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Droplet className="w-5 h-5 text-primary-500" />
            <h4 className="text-lg font-semibold">Care Instructions</h4>
          </div>
          <div className="p-4 bg-default-100 rounded-lg">
            <p className="text-default-700 leading-relaxed">
              {classes[flowerClass].care}
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
