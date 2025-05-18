import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  DataSetDataItem,
  DataSetDataGroup,
  DataGroup,
  DataItem,
  Timeline,
  TimelineOptions,
  DateType
} from 'vis-timeline';
import {DataSet} from 'vis-data';
import {TimelineItem} from 'vis-timeline/types';
import {addWeeks} from 'date-fns';

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

  @Output() eventDateChanged = new EventEmitter<TimelineItem>();

  groupsData = new DataSet(this.groups);
  itemsData = new DataSet(this.items);

  ngAfterViewInit() {
    this.initTimeline();
  }

  ngOnChanges(){
    this.initTimeline();
  }

  private initTimeline() {
    if (!this.timelineContainer) return;

    const container = this.timelineContainer.nativeElement;

    this.groupsData = new DataSet(this.groups);
    this.itemsData = new DataSet(this.items);
    const startTime:DateType|undefined = this.itemsData.get().find(item => (item.id ? item.id.toString() : "").startsWith("T1_"))?.start;
    console.log("Starttime", startTime);
    const options:TimelineOptions = {
      start: startTime? startTime: new Date(),
      end: addWeeks(new Date(), 2),
      editable: true,
      zoomable: true,
      stack: true,
      orientation: 'top',
      timeAxis: { scale: 'hour', step: 1 },
      margin: { item: 10 },
      onMove:  (item, callback) => {
        const prefix = (item.id + "").split("_")[0];
        console.log(prefix)
        this.itemsData.forEach(event => {
          const prefixItem= (event.id+"").split("_")[0]
          if(event.id !== item.id &&  prefixItem === prefix){
            console.log(event)
            event.start = item.start;
            event.end = item.end;
          }
        });
        callback(item);
        this.eventDateChanged.emit(item);
        this.timeline.setItems(this.itemsData);
      },
    };

    if (this.timeline) {
      this.timeline.destroy();
    }

    this.timeline = new Timeline(container, this.itemsData, this.groupsData, options);

  }
}
