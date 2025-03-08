import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {DataSetDataItem, DataSetDataGroup, DataGroup, DataItem, Timeline, TimelineOptions} from 'vis-timeline';
import {DataSet} from 'vis-data';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css'
})
export class TimelineComponent implements AfterViewInit, OnChanges {
  @ViewChild('timeline') timelineContainer!: ElementRef;
  private timeline!: Timeline;

  @Input() items: DataItem[] = [];
  @Input() groups: DataGroup[] = [];

  ngAfterViewInit() {
    this.initTimeline();
  }

  ngOnChanges(){
    this.initTimeline();
  }

  private initTimeline() {
    if (!this.timelineContainer) return;

    const container = this.timelineContainer.nativeElement;

    const groupsData = new DataSet(this.groups);
    const itemsData = new DataSet(this.items);

    const options:TimelineOptions = {
      start: new Date(2025, 2, 10, 6, 0),
      end: new Date(2025, 2, 10, 20, 0),
      editable: true,
      zoomable: true,
      stack: true,
      orientation: 'top',
      timeAxis: { scale: 'hour', step: 1 },
      margin: { item: 10 }
    };

    if (this.timeline) {
      this.timeline.destroy(); // Falls bereits existiert, erst löschen
    }

    this.timeline = new Timeline(container, itemsData, groupsData, options);

    // Event-Handling für Drag & Drop
    this.timeline.on('change', (props) => {
      console.log('Event geändert:', itemsData.get(props));
    });
  }
}
