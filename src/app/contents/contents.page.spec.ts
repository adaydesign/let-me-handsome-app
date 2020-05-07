import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContentsPage } from './contents.page';

describe('ContentsPage', () => {
  let component: ContentsPage;
  let fixture: ComponentFixture<ContentsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContentsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
